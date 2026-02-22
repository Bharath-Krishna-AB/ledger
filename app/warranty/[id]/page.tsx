import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WarrantyDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: item, error } = await supabase
        .from('purchase_items')
        .select(`
            *,
            purchases (
                merchant,
                transaction_id,
                payment_date
            )
        `)
        .eq('id', id)
        .single()

    if (error || !item) {
        return <div className="p-8 text-center text-red-500">Item not found</div>
    }

    // Timeline calculations
    const paymentDateStr = item.purchases?.payment_date
    const paymentDate = new Date(paymentDateStr).toLocaleDateString()

    let returnDateStr = "No Return Window"
    if (item.return_deadline) {
        returnDateStr = new Date(item.return_deadline).toLocaleDateString()
    }

    let warrantyDateStr = "No Warranty"
    if (item.warranty_expiry_date) {
        warrantyDateStr = new Date(item.warranty_expiry_date).toLocaleDateString()
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <Link href="/warranty" className="text-blue-600 hover:underline mb-6 inline-block text-sm">
                &larr; Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                    <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                    <p className="text-gray-500 mt-1">{item.purchases?.merchant} • SKU: {item.sku}</p>
                    <p className="text-2xl font-semibold mt-4">₹{item.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Protection Timeline
                    </h3>

                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">

                        {/* 1. Purchase Date */}
                        <div className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Purchased</p>
                            <p className="font-medium text-gray-900">{paymentDate}</p>
                        </div>

                        {/* 2. Return Deadline */}
                        {item.return_window_days > 0 && (
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Return Window Closes</p>
                                <p className="font-medium text-gray-900">{returnDateStr}</p>
                                <p className="text-xs text-gray-400 mt-1">({item.return_window_days} Days)</p>
                            </div>
                        )}

                        {/* 3. Warranty Deadline */}
                        {item.warranty_months > 0 && (
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Warranty Expires</p>
                                <p className="font-medium text-gray-900">{warrantyDateStr}</p>
                                <p className="text-xs text-gray-400 mt-1">({item.warranty_months} Months)</p>
                            </div>
                        )}

                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Receipt Details</h3>
                    <div className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs font-mono text-gray-700">
                        <pre>
                            {JSON.stringify({
                                transaction_id: item.purchases?.transaction_id,
                                merchant: item.purchases?.merchant,
                                date: item.purchases?.payment_date,
                                items: [
                                    {
                                        name: item.name,
                                        sku: item.sku,
                                        price: item.price,
                                        warranty: `${item.warranty_months} months`,
                                        return: `${item.return_window_days} days`
                                    }
                                ]
                            }, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
