"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";
import gsap from "gsap";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ScanFace, Receipt, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { processMockScan, ScannedReceipt } from "@/app/warranty/actions";
import { useFinance } from "@/context/FinanceContext";

async function saveToIndexedDB(records: any | any[]) {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("ledger-db", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("transactions")) {
                db.createObjectStore("transactions", { keyPath: "id" });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("transactions", "readwrite");
            const store = tx.objectStore("transactions");

            const bills = Array.isArray(records) ? records : [records];

            bills.forEach(bill => {
                store.add({ ...bill, id: bill.id || crypto.randomUUID() });
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        };

        request.onerror = () => reject(request.error);
    });
}

export function ScannerClient() {
    const { syncExternalTransactions } = useFinance();
    const viewRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const stoppedRef = useRef(false);
    // Use a ref for the processing guard so changes don't retrigger the scanner useEffect
    const isProcessingRef = useRef(false);

    const [generatedQr, setGeneratedQr] = useState<string | null>(null);
    const [parsedBill, setParsedBill] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (viewRef.current) {
            gsap.fromTo(
                viewRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, []);

    useEffect(() => {
        const initScanner = async () => {
            try {
                const scanner = new Html5Qrcode("reader");
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        // Higher fps = faster detection. qrbox as a fraction keeps it centred
                        // without needing a fixed pixel size that might be too large on mobile.
                        fps: 15,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    async (decodedText) => {
                        // Use ref guard to avoid re-running if already processing
                        if (stoppedRef.current || isProcessingRef.current) return;
                        stoppedRef.current = true;
                        isProcessingRef.current = true;
                        setIsProcessing(true);
                        setError(null);

                        try {
                            const url = new URL(decodedText);
                            const params = new URLSearchParams(url.search);
                            const billString = params.get("bill");

                            if (billString) {
                                const decodedBill = JSON.parse(decodeURIComponent(billString));
                                setParsedBill(decodedBill);

                                const res = await fetch("/api/ledger/transactions", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        bill: decodedBill,
                                        categories: JSON.parse(localStorage.getItem("customCategories") || '[]')
                                    }),
                                });

                                if (!res.ok) throw new Error("Failed to process transaction.");

                                const savedTx = await res.json();
                                await saveToIndexedDB(savedTx);
                                syncExternalTransactions(savedTx);

                                // --- Warranty Tracker Integration ---
                                // Map the decoded QR receipt format to the Expected Warranty format
                                const warrantyPayload: ScannedReceipt = {
                                    merchant: decodedBill.merchant || "Unknown Merchant",
                                    merchant_id: decodedBill.merchant_id || "UNKNOWN",
                                    transaction_id: decodedBill.invoice || `TXN-${Date.now()}`,
                                    payment_date: decodedBill.date || new Date().toISOString().split('T')[0],
                                    total: decodedBill.total || (
                                        (decodedBill.items ? decodedBill.items.reduce((acc: number, item: any) => acc + (item.p * item.q), 0) : 0) + (decodedBill.tax || 0)
                                    ),
                                    currency: "INR",
                                    items: decodedBill.items ? decodedBill.items.map((item: any) => ({
                                        name: item.n || "Unknown Item",
                                        sku: item.s || `SKU-${Date.now()}`,
                                        category: item.c || "uncategorized",
                                        price: item.p || 0,
                                        quantity: item.q || 1,
                                        // Some QR payloads might have these, otherwise default to Mock logic
                                        warranty_months: item.wm || 12, // Assume 1 yr default if not specified
                                        return_window_days: item.rwd || 7, // Assume 7 day return by default
                                    })) : []
                                };

                                await processMockScan(warrantyPayload); // Async save to DB
                                // -------------------------------------

                                params.delete("bill");

                                const cleanedUrl =
                                    `${url.protocol}//${url.host}${url.pathname}` +
                                    (params.toString() ? `?${params.toString()}` : "");

                                await scanner.stop().catch(() => { });

                                const newQr = await QRCode.toDataURL(cleanedUrl, {
                                    width: 300,
                                    margin: 2,
                                    color: { dark: '#000000', light: '#ffffff' }
                                });

                                setGeneratedQr(newQr);
                            } else {
                                setError("No bill data found in this QR code.");
                                stoppedRef.current = false;
                                isProcessingRef.current = false;
                                setIsProcessing(false);
                            }
                        } catch (err) {
                            console.error("Invalid QR:", err);
                            setError("Failed to process the QR Code. Please try again.");
                            await scanner.stop().catch(() => { });
                            isProcessingRef.current = false;
                            setIsProcessing(false);
                        }
                    },
                    () => {
                        // Suppress per-frame decode failure noise
                    }
                );
            } catch (err) {
                console.error("Camera access error", err);
                setError("Unable to access camera. Please check permissions.");
            }
        };

        // Short delay to let the DOM & animations settle before camera kicks in
        const timer = setTimeout(() => {
            if (!generatedQr) initScanner();
        }, 300);

        return () => {
            clearTimeout(timer);
            if (!stoppedRef.current && scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
        // ⚠️ Intentionally exclude `isProcessing` from deps – we use isProcessingRef
        // so that state changes do NOT restart the scanner mid-session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedQr]);


    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

                <Header />

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 pt-8 pb-32 lg:pb-20 custom-scrollbar z-0 w-full relative">
                    <div ref={viewRef} className="max-w-4xl mx-auto space-y-8">
                        <div className="mb-8 lg:mb-10 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-primary/10 mb-4 lg:mb-6">
                                <ScanFace className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 px-4">Smart Receipt Scanner</h1>
                            <p className="text-sm lg:text-base text-gray-500 max-w-xl mx-auto font-medium px-4">Point your camera at a supported vendor invoice or QR code. We'll automatically digitize the receipt and log it to your ledger.</p>
                        </div>

                        <div className="bg-white border border-gray-100 shadow-soft rounded-[32px] overflow-hidden relative min-h-[400px] lg:min-h-[500px] flex flex-col items-center justify-center p-4 lg:p-8 w-full">

                            {error && (
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-6 py-3 rounded-full text-sm font-semibold shadow-soft z-50 animate-in slide-in-from-top-4">
                                    {error}
                                </div>
                            )}

                            {!generatedQr && !isProcessing && (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="relative w-full max-w-[400px] aspect-square rounded-[32px] lg:rounded-[40px] overflow-hidden shadow-inner border-4 border-gray-50">
                                        {/* The #reader div where html5-qrcode injects the video stream */}
                                        <div id="reader" className="w-full h-full object-cover rounded-[36px]" />

                                        {/* Viewfinder crosshairs overlaid on top */}
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                                            <div className="w-3/4 h-3/4 border-2 border-dashed border-white/50 rounded-3xl relative">
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl -mt-1 -ml-1"></div>
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl -mt-1 -mr-1"></div>
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl -mb-1 -ml-1"></div>
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl -mb-1 -mr-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Waiting for QR Code...</p>
                                </div>
                            )}

                            {isProcessing && !generatedQr && (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">Processing Receipt...</h3>
                                    <p className="text-sm text-gray-500 font-medium">Extracting data and matching categories.</p>
                                </div>
                            )}

                            {generatedQr && parsedBill && (
                                <div className="flex w-full flex-col lg:flex-row gap-12 items-center justify-center animate-in zoom-in-95 duration-500">

                                    {/* Digital Receipt Card */}
                                    <div className="w-full max-w-sm bg-gray-50 border border-gray-100 rounded-[32px] p-8 shadow-inner relative">
                                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform -rotate-12 outline-4 outline-white">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="text-center mb-6 pb-6 border-b border-gray-200 border-dashed">
                                            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Receipt Digitized</h3>
                                            <p className="text-xl font-bold text-gray-900">{parsedBill.invoice || "Invoice"}</p>
                                            <p className="text-xs text-gray-500 mt-1">{parsedBill.date}</p>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            {parsedBill.items && parsedBill.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{item.n}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.q}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">₹{(item.p * item.q).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 border-solid space-y-2">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Subtotal</span>
                                                <span>₹{parsedBill.subtotal?.toLocaleString() || "0"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Tax</span>
                                                <span>₹{parsedBill.tax?.toLocaleString() || "0"}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 pt-2 border-t border-gray-900">
                                                <span>Total Paid</span>
                                                <span>₹{parsedBill.total?.toLocaleString() || "0"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clean Payment QR */}
                                    <div className="flex flex-col items-center text-center max-w-xs">
                                        <div className="bg-white p-4 rounded-3xl shadow-soft-lg mb-6">
                                            <img src={generatedQr} alt="Cleaned Payment QR" className="w-[220px] h-[220px] object-contain rounded-xl" />
                                        </div>
                                        <h4 className="font-bold text-lg text-foreground mb-2">Ready for Payment</h4>
                                        <p className="text-sm text-gray-500 font-medium mb-6">The receipt data has been securely logged. You can now scan this clean QR with your UPI app to complete the payment.</p>

                                        <button
                                            onClick={() => window.location.reload()}
                                            className="w-full bg-black text-white rounded-full py-4 text-sm font-bold shadow-soft hover:shadow-soft-lg hover:bg-gray-800 transition-all flex justify-center items-center gap-2"
                                        >
                                            Scan Another <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
