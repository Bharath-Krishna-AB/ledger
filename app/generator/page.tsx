"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function GenerateUPIQR() {
  const originalUpiUrl = "upi://pay?pa=antonykc05-1@oksbi";

  const bill = {
    invoice: "INV1024",
    date: "2026-02-21",
    gstin: "32ABCDE1234F1Z5",
    items: [{ n: "Shirt", q: 1, p: 80 }],
    subtotal: 80,
    tax: 20,
    total: 100,
  };

  const [qr, setQr] = useState("");

  useEffect(() => {
    const encodedBill = encodeURIComponent(JSON.stringify(bill));

    const separator = originalUpiUrl.includes("?") ? "&" : "?";
    const finalUrl = `${originalUpiUrl}${separator}bill=${encodedBill}`;

    QRCode.toDataURL(finalUrl, { width: 260, margin: 1 })
      .then(setQr)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {qr && <img src={qr} alt="UPI QR" />}
    </div>
  );
}