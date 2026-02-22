import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { WarrantyCard, PurchaseItem } from '@/components/warranty/WarrantyCard'
import { MockScanner } from '@/components/warranty/MockScanner'
import { NotificationEngine } from '@/components/warranty/NotificationEngine'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default async function WarrantyDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch items with purchase data, sorted by payment_date DESC
    const { data: items, error } = await supabase
        .from('purchase_items')
        .select(`
            *,
            purchases (
                merchant,
                payment_date
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching warranty items:', error)
    }

    // Map DB relationship to our clean PurchaseItem type
    const formattedItems: PurchaseItem[] = items?.map(item => ({
        id: item.id,
        purchase_id: item.purchase_id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        warranty_months: item.warranty_months,
        return_window_days: item.return_window_days,
        warranty_expiry_date: item.warranty_expiry_date,
        return_deadline: item.return_deadline,
        merchant: item.purchases?.merchant || 'Unknown Merchant',
        payment_date: item.purchases?.payment_date || new Date().toISOString()
    })) || []

    return (
        <div className="flex bg-background h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <Header />

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pt-8 pb-32 lg:pb-20 custom-scrollbar z-0 w-full relative">
                    <div className="max-w-6xl mx-auto space-y-12">

                        <div className="bg-white border border-gray-100 shadow-soft p-8 md:p-12 relative overflow-hidden rounded-[32px]">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Warranties & Returns</h1>
                            <p className="text-sm text-gray-500 font-medium mt-2 max-w-lg">Track the lifecycle of your purchases, active warranties, and return windows directly from scanned receipts.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="md:col-span-3 space-y-4">
                                {formattedItems.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-soft">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">No receipts scanned yet</h3>
                                        <p className="text-sm text-gray-500 font-medium">Scan a QR code to track your returns and warranties.</p>
                                    </div>
                                ) : (
                                    formattedItems.map(item => (
                                        <WarrantyCard key={item.id} item={item} />
                                    ))
                                )}
                            </div>

                            <div className="md:col-span-1 space-y-6">
                                <MockScanner />

                                {/* The Background local notification scheduler */}
                                <NotificationEngine items={formattedItems} />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}
