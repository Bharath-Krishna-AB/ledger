"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import gsap from "gsap";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { QrCode, Plus, Link as LinkIcon, Download } from "lucide-react";

export function GeneratorClient() {
    const viewRef = useRef<HTMLDivElement>(null);

    const [upiId, setUpiId] = useState("antonykc05-1@oksbi");
    const [invoice, setInvoice] = useState("INV1024");
    const [itemName, setItemName] = useState("Consulting Services");
    const [itemPrice, setItemPrice] = useState<number>(1500);
    const [tax, setTax] = useState<number>(18);

    const [qr, setQr] = useState("");

    const originalUpiUrl = `upi://pay?pa=${upiId}`;

    const subtotal = itemPrice;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount;

    const bill = {
        invoice: invoice,
        date: new Date().toISOString().split('T')[0],
        gstin: "32ABCDE1234F1Z5", // Placeholder
        items: [{ n: itemName, q: 1, p: itemPrice }],
        subtotal: subtotal,
        tax: taxAmount,
        total: total,
    };

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
        // Generate QR internally on change
        const encodedBill = encodeURIComponent(JSON.stringify(bill));
        const separator = originalUpiUrl.includes("?") ? "&" : "?";
        const finalUrl = `${originalUpiUrl}${separator}bill=${encodedBill}`;

        QRCode.toDataURL(finalUrl, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
            .then(setQr)
            .catch(console.error);
    }, [upiId, invoice, itemName, itemPrice, tax]);

    const handleDownload = () => {
        if (!qr) return;
        const link = document.createElement('a');
        link.download = `QR-${invoice}.png`;
        link.href = qr;
        link.click();
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

                <Header />

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 pt-8 pb-32 lg:pb-20 custom-scrollbar z-0 w-full relative">
                    <div ref={viewRef} className="max-w-6xl mx-auto space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
                                    <QrCode className="w-8 h-8 text-primary" />
                                    Dynamic QR Generator
                                </h1>
                                <p className="text-gray-500">Create smart UPI payment QR codes embedded with invoice and category data.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
                            {/* Left Column: Form Controls */}
                            <div className="bg-white border border-gray-100 shadow-soft p-8 rounded-[32px] space-y-6">
                                <div>
                                    <h3 className="font-semibold text-xl text-gray-500 flex items-center gap-2 mb-6">
                                        <LinkIcon className="w-5 h-5 text-gray-400" />
                                        Payment Details
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-2 block">UPI ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-2 block">Invoice ID</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground uppercase"
                                                value={invoice}
                                                onChange={(e) => setInvoice(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500 mb-2 block">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground"
                                                value={tax}
                                                min="0"
                                                max="100"
                                                onChange={(e) => setTax(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="text-sm font-semibold text-foreground mb-2 block">Item / Service Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground"
                                            value={itemName}
                                            onChange={(e) => setItemName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 mb-2 block">Item Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground"
                                            value={itemPrice || ""}
                                            onChange={(e) => setItemPrice(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: QR Preview */}
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-100 shadow-inner rounded-[32px] relative overflow-hidden group">
                                <div className="absolute top-0 w-full h-full bg-grid-pattern opacity-5 pointer-events-none"></div>

                                <div className="bg-white p-6 rounded-3xl shadow-soft-lg z-10 hover:-translate-y-2 transition-transform duration-300">
                                    {qr ? (
                                        <img src={qr} alt="Generated UPI QR" className="w-[260px] h-[260px] object-contain rounded-xl" />
                                    ) : (
                                        <div className="w-[260px] h-[260px] bg-gray-100 rounded-xl flex items-center justify-center animate-pulse">
                                            <QrCode className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 text-center z-10">
                                    <h4 className="text-xl font-bold tracking-tight text-foreground mb-1">Total: ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                                    <p className="text-sm font-semibold text-gray-400">Includes {tax}% Tax</p>
                                </div>

                                <div className="mt-8 z-10 w-full max-w-xs">
                                    <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-all shadow-soft hover:shadow-soft-lg">
                                        <Download className="w-5 h-5" />
                                        Download QR
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
