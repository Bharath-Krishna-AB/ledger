'use client'

import { useEffect } from 'react'
import { PurchaseItem } from './WarrantyCard'

export function NotificationEngine({ items }: { items: PurchaseItem[] }) {
    useEffect(() => {
        // Request Permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }

        // If granted, check items
        if ('Notification' in window && Notification.permission === 'granted') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // NOTE: In a real prod app, you'd use a local tracking flag (e.g. localStorage)
            // to ensure you only alert them ONCE per item/deadline. For this hackathon demo,
            // we will just alert on Mount.

            items.forEach((item) => {
                // Return Deadline Check
                if (item.return_window_days > 0 && item.return_deadline) {
                    const returnDate = new Date(item.return_deadline)
                    const diffTime = returnDate.getTime() - today.getTime()
                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                    if (daysRemaining === 3 || daysRemaining === 1) {
                        new Notification('Return Window Closing', {
                            body: `⚠️ Your ${item.name} return window closes in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
                            icon: '/favicon.ico'
                        })
                    }
                }

                // Warranty Expiry Check
                if (item.warranty_months > 0 && item.warranty_expiry_date) {
                    const warrantyDate = new Date(item.warranty_expiry_date)
                    const diffTime = warrantyDate.getTime() - today.getTime()
                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                    if (daysRemaining === 30 || daysRemaining === 7) {
                        new Notification('Warranty Expiring Soon', {
                            body: `🔧 Your warranty for ${item.name} expires in ${daysRemaining} days — consider extended warranty or servicing.`,
                            icon: '/favicon.ico'
                        })
                    }
                }
            })
        }
    }, [items])

    return null; // This is a headless component processing alerts in the background.
}
