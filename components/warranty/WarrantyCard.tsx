import Link from "next/link";

export type PurchaseItem = {
    id: string
    purchase_id: string
    name: string
    sku: string
    price: number
    payment_date: string
    merchant: string
    warranty_months: number
    return_window_days: number
    warranty_expiry_date: string | null
    return_deadline: string | null
}

const getDaysRemaining = (targetDate: string | null) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const ReturnBadge = ({ return_window_days, return_deadline }: PurchaseItem) => {
    if (return_window_days === 0) return null; // Edge Case: Items with no return window

    const daysRemaining = getDaysRemaining(return_deadline);

    if (daysRemaining === null) return null;

    let colorClass = "bg-green-100 text-green-800 border-green-200";
    let text = `${daysRemaining} days left to return`;

    if (daysRemaining < 0) {
        colorClass = "bg-gray-100 text-gray-500 border-gray-200";
        text = "Return window expired";
    } else if (daysRemaining <= 3) {
        colorClass = "bg-red-100 text-red-800 border-red-200";
        text = `Return ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
    } else if (daysRemaining <= 7) {
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
    }

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
            {text}
        </span>
    )
}

const WarrantyBadge = ({ warranty_months, warranty_expiry_date }: PurchaseItem) => {
    if (warranty_months === 0) {
        // Edge Case: Items with no warranty
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                No warranty
            </span>
        )
    }

    const daysRemaining = getDaysRemaining(warranty_expiry_date);
    if (daysRemaining === null) return null;

    let colorClass = "bg-blue-100 text-blue-800 border-blue-200";
    let text = "Warranty Active";

    if (daysRemaining < 0) {
        // Edge Case: Already expired warranties
        colorClass = "bg-gray-100 text-gray-500 border-gray-200";
        text = "Warranty Expired";
    } else if (daysRemaining <= 30) {
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200 text-orange-600 border-orange-200";
        text = `Warranty expires in ${daysRemaining} days`;
    }

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
            {text}
        </span>
    )
}

export function WarrantyCard({ item }: { item: PurchaseItem }) {
    return (
        <Link href={`/warranty/${item.id}`} className="block">
            <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mb-1">{item.merchant}</p>
                        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <ReturnBadge {...item} />
                    <WarrantyBadge {...item} />
                </div>
            </div>
        </Link>
    )
}
