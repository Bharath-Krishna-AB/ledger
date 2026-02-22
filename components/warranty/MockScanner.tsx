'use client'

import { useState } from 'react'
import { processMockScan, ScannedReceipt } from '@/app/warranty/actions'

const MOCK_DATA: ScannedReceipt = {
    merchant: "Vijay Sales",
    merchant_id: "VS001",
    transaction_id: "TXN123456",
    payment_date: "2024-02-21", // 2 years ago for testing expired/expiring soon
    items: [
        {
            name: "Samsung Washing Machine WA70",
            sku: "SAM-WA70",
            category: "electronics",
            price: 32000,
            quantity: 1,
            warranty_months: 24, // expiring today for testing
            return_window_days: 7 // already expired
        },
        {
            name: "Sony Headphones",
            sku: "SONY-H1",
            category: "electronics",
            price: 4999,
            quantity: 1,
            warranty_months: 0, // no warranty
            return_window_days: 30 // already expired
        },
        {
            name: "Apple iPhone 15",
            sku: "APL-IP15",
            category: "electronics",
            price: 80000,
            quantity: 1,
            warranty_months: 12, // already expired
            return_window_days: 0 // no return
        }
    ],
    total: 116999,
    currency: "INR"
}

// Add a genuinely new item for testing notifications easily
MOCK_DATA.items.push({
    name: "Dyson Vacuum v15",
    sku: "DYS-V15",
    category: "home",
    price: 45000,
    quantity: 1,
    warranty_months: 24, // active
    return_window_days: 5 // return ends in 5 days, testing "green" status
})

export function MockScanner() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleScan = async () => {
        setLoading(true)
        setMessage('')

        try {
            // Give it today's date dynamically to one item so notifications definitely trigger 
            const dynamicData = JSON.parse(JSON.stringify(MOCK_DATA))

            // Item 1: Purchase yesterday. Return window 3 days (trigger red warning)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            dynamicData.payment_date = yesterday.toISOString().split('T')[0]

            // Dynamic item
            dynamicData.items.push({
                name: "Logitech Mouse",
                sku: "LOG-M1",
                category: "electronics",
                price: 1500,
                quantity: 1,
                warranty_months: 1, // expiring next month
                return_window_days: 3 // Ends in 2 days from today (Red)
            })

            const result = await processMockScan(dynamicData)

            if (result?.error) {
                setMessage(result.error)
            } else {
                setMessage('Added mock receipt successfully!')

                // Immediately trigger a test Notification as per Acceptance criteria
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Receipt Scanned', {
                        body: 'Items added to your Dashboard. Checking for any alerts...',
                        icon: '/favicon.ico'
                    })
                }
            }
        } catch (err) {
            setMessage('Failed to process mock scan')
        } finally {
            setLoading(false)
            setTimeout(() => setMessage(''), 3000)
        }
    }

    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">Test Scanner</h3>
            <p className="text-sm text-slate-500 mb-4 shadow-sm">Simulate scanning a store receipt QR code.</p>
            <button
                onClick={handleScan}
                disabled={loading}
                className="bg-black hover:bg-slate-800 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? 'Processing...' : 'Mock QR Scan'}
            </button>
            {message && <p className="mt-2 text-sm text-green-600 font-medium">{message}</p>}
        </div>
    )
}
