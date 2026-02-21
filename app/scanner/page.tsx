"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";

async function saveToIndexedDB(bill: any) {
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
      const tx = db
        .transaction("transactions", "readwrite")
        .objectStore("transactions")
        .add({ ...bill, id: bill.id || crypto.randomUUID() });

      tx.onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);

  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [parsedBill, setParsedBill] = useState<any>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        if (stoppedRef.current) return;
        stoppedRef.current = true;

        try {
          const url = new URL(decodedText);
          const params = new URLSearchParams(url.search);
          const bill = params.get("bill");

          if (bill) {
            const decodedBill = JSON.parse(decodeURIComponent(bill));
            setParsedBill(decodedBill);

            const res = await fetch("/api/ledger/transactions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bill: decodedBill,
                categories: JSON.parse(localStorage.getItem("customCategories") || '[]')
              }),
            });

            const savedTx = await res.json();
            await saveToIndexedDB(savedTx);

            params.delete("bill");

            const cleanedUrl =
              `${url.protocol}//${url.host}${url.pathname}` +
              (params.toString() ? `?${params.toString()}` : "");

            await scanner.stop().catch(() => {});

            const newQr = await QRCode.toDataURL(cleanedUrl, {
              width: 260,
              margin: 1,
            });

            setGeneratedQr(newQr);
          }
        } catch (err) {
          console.error("Invalid QR:", err);
          await scanner.stop().catch(() => {});
        }
      },
      (errorMessage) => {
        // Ignoring frame decode errors (these fire continuously until a valid QR is found)
      }
    );

    return () => {
      if (!stoppedRef.current && scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {!generatedQr && <div id="reader" style={{ width: 300 }} />}

      {generatedQr && (
        <>
          <img src={generatedQr} alt="Clean UPI QR" />
          {parsedBill && (
            <pre
              style={{
                marginTop: 20,
                padding: 12,
                background: "#f5f5f5",
                borderRadius: 6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(parsedBill, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}