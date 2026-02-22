'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReceiptItem = {
    name: string
    sku: string
    category: string
    price: number
    quantity: number
    warranty_months: number
    return_window_days: number
}

export type ScannedReceipt = {
    merchant: string
    merchant_id: string
    transaction_id: string
    payment_date: string
    items: ReceiptItem[]
    total: number
    currency: string
}

export async function processMockScan(receiptData: ScannedReceipt) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Authentication required' }
    }

    // 1. Insert the main purchase record
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
            user_id: user.id,
            merchant: receiptData.merchant,
            merchant_id: receiptData.merchant_id,
            transaction_id: receiptData.transaction_id,
            payment_date: receiptData.payment_date,
            total: receiptData.total,
            currency: receiptData.currency
        })
        .select()
        .single()

    if (purchaseError) {
        console.error('Error inserting purchase:', purchaseError)
        return { error: 'Failed to save purchase details' }
    }

    // 2. Prepare items with calculated dates
    const paymentDate = new Date(receiptData.payment_date)

    const itemsToInsert = receiptData.items.map(item => {
        // Calculate Warranty Expiry
        let warrantyExpiryDate = null
        if (item.warranty_months > 0) {
            const expiry = new Date(paymentDate)
            expiry.setMonth(expiry.getMonth() + item.warranty_months)
            warrantyExpiryDate = expiry.toISOString().split('T')[0] // YYYY-MM-DD
        }

        // Calculate Return Deadline
        let returnDeadline = null
        if (item.return_window_days > 0) {
            const deadline = new Date(paymentDate)
            deadline.setDate(deadline.getDate() + item.return_window_days)
            returnDeadline = deadline.toISOString().split('T')[0] // YYYY-MM-DD
        }

        return {
            purchase_id: purchase.id,
            user_id: user.id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
            warranty_months: item.warranty_months,
            return_window_days: item.return_window_days,
            warranty_expiry_date: warrantyExpiryDate,
            return_deadline: returnDeadline
        }
    })

    // 3. Insert all items
    const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Error inserting purchase items:', itemsError)
        return { error: 'Failed to save purchased items' }
    }

    // Refresh the dashboard
    revalidatePath('/warranty')
    return { success: true, message: 'Receipt scanned successfully!' }
}
