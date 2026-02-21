"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);

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
            await fetch("/api/ledger/ingest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bill: JSON.parse(decodeURIComponent(bill)),
              }),
            });

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
      {generatedQr && <img src={generatedQr} alt="Clean UPI QR" />}
    </div>
  );
}