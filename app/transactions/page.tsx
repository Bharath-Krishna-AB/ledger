"use client";

import { useEffect, useState } from "react";

function getAllTransactions(): Promise<any[]> {
  return new Promise((resolve, reject) => {
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
        .transaction("transactions", "readonly")
        .objectStore("transactions")
        .getAll();

      tx.onsuccess = () => resolve(tx.result as any[]);
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[] | null>(null);

  useEffect(() => {
    getAllTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, []);

  if (transactions === null) return null;

  return (
    <pre>
      {JSON.stringify(transactions, null, 2)}
    </pre>
  );
}