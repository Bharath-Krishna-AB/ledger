"use client";

import React, { useRef, useEffect, useState } from "react";
import { Sidebar } from "../Sidebar";
import gsap from "gsap";
import { Header } from "../Header";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Zap,
    Calculator,
    ArrowRight,
    Plus,
    X
} from "lucide-react";
import { useFinance, Subscription } from "@/context/FinanceContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsClient() {
    const { accounts, subscriptions, addSubscription, deleteSubscription } = useFinance();
    const viewRef = useRef<HTMLDivElement>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [subName, setSubName] = useState("");
    const [subAmount, setSubAmount] = useState("");
    const [subUsage, setSubUsage] = useState("Medium");
    const [subCategory, setSubCategory] = useState("Software");

    useEffect(() => {
        if (viewRef.current) {
            gsap.fromTo(
                viewRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, []);

    const totalRecurring = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const potentialSavings = subscriptions.filter(s => s.usage === 'Low').reduce((sum, sub) => sum + sub.amount, 0);

    const handleAddSubscription = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subName || !subAmount) return;

        addSubscription({
            name: subName,
            amount: parseFloat(subAmount),
            status: 'Active',
            usage: subUsage,
            category: subCategory
        });

        setIsAddModalOpen(false);
        setSubName("");
        setSubAmount("");
        setSubUsage("Medium");
        setSubCategory("Software");
    };

    // --- What-If Simulator Logic ---
    const [simPurchaseName, setSimPurchaseName] = useState("New Car Downpayment");
    const [simPurchaseAmount, setSimPurchaseAmount] = useState<number>(500000);
    const [simMonthOffset, setSimMonthOffset] = useState<number>(3); // Purchase happens in month 3

    // Generate 12 months of projection data based on a base growth rate
    const generateProjectionData = () => {
        const currentTotalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const baseNetWorth = currentTotalNetWorth > 0 ? currentTotalNetWorth : 2500000;
        const monthlySavings = 85000;
        const data = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let currentBase = baseNetWorth;
        let currentSimulated = baseNetWorth;

        for (let i = 0; i < 12; i++) {
            currentBase += monthlySavings;

            if (i === simMonthOffset) {
                currentSimulated = currentBase - simPurchaseAmount;
            } else if (i > simMonthOffset) {
                currentSimulated += monthlySavings; // Resumes normal savings rate post-purchase
            } else {
                currentSimulated = currentBase;
            }

            data.push({
                month: months[i],
                baseline: currentBase,
                simulated: currentSimulated,
                isPurchaseMonth: i === simMonthOffset
            });
        }
        return data;
    };

    const projectionData = generateProjectionData();
    const finalBaseline = projectionData[11].baseline;
    const finalSimulated = projectionData[11].simulated;
    const recoveryMonths = Math.ceil(simPurchaseAmount / 85000);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

                <Header />

                <main className="flex-1 overflow-y-auto px-10 pt-8 pb-20 custom-scrollbar z-0">
                    <div ref={viewRef} className="max-w-6xl mx-auto space-y-8">

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
                                    <Zap className="w-8 h-8 text-primary" />
                                    AI Financial Insights
                                </h1>
                                <p className="text-gray-500">Advanced analytics to optimize your recurring expenses and project future wealth.</p>
                            </div>
                        </div>

                        {/* Subscription Bloat Analyzer */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Summary & Savings Callout */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white border border-gray-100 rounded-[32px] shadow-soft p-8 relative overflow-hidden group">
                                    <h3 className="font-semibold text-xl text-gray-500 mb-4">Subscription Overview</h3>
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 mb-1">Total Recurring (Monthly)</p>
                                        <p className="text-4xl font-bold tracking-tight text-foreground">₹{totalRecurring.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-red-50/80 border border-red-100 rounded-[24px] p-6">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-red-700">Optimization Opportunity</p>
                                                <p className="text-sm text-red-600 mt-1">
                                                    You are paying <strong>₹{potentialSavings.toLocaleString()}</strong> for low-usage subscriptions. Consider cancelling them.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed List */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] shadow-soft p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-semibold text-xl text-gray-500">Identified Subscriptions</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full text-xs font-semibold hidden sm:flex items-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Live Data
                                        </span>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all shadow-soft hover:shadow-soft-lg"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {subscriptions.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center py-8">No subscriptions found. Click "Add" to track them.</p>
                                    ) : subscriptions.map((sub) => (
                                        <div key={sub.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[24px] border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all gap-4 relative">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    {sub.category === 'Software' ? <Activity className="w-5 h-5 text-gray-400" /> : <Activity className="w-5 h-5 text-gray-400" />}
                                                </div>
                                                <div className="pt-1">
                                                    <h4 className="font-bold text-foreground">{sub.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{sub.category}</span>
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sub.usage === 'High' ? 'bg-green-100 text-green-700' :
                                                            sub.usage === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {sub.usage} Usage
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto">
                                                <p className="text-xl font-bold text-foreground">₹{sub.amount.toLocaleString()}</p>
                                            </div>

                                            {/* Delete Button overlay on hover */}
                                            <button
                                                onClick={() => deleteSubscription(sub.id)}
                                                className="absolute -top-2 -right-2 bg-white text-red-500 p-2 border border-red-100 rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                                title="Delete Subscription"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* What-If Wealth Simulator */}
                        <div className="bg-white border border-gray-100 shadow-soft rounded-[32px] p-8 lg:p-12 mt-8">
                            <div className="flex flex-col lg:flex-row gap-12">

                                {/* Simulator Controls */}
                                <div className="lg:w-1/3 xl:w-1/4 space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-500 flex items-center gap-2 mb-2">
                                            <Calculator className="w-6 h-6 text-primary" />
                                            &apos;What-If&apos; Simulator
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6">Test how a large upcoming expense impacts your 12-month Net Worth projection.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1 block">Hypothetical Goal</label>
                                            <input
                                                type="text"
                                                value={simPurchaseName}
                                                onChange={(e) => setSimPurchaseName(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground placeholder:text-gray-400"
                                                placeholder="e.g. Europe Vacation"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500 mb-2 block">Cost Estimate (₹)</label>
                                            <input
                                                type="number"
                                                value={simPurchaseAmount || ''}
                                                onChange={(e) => setSimPurchaseAmount(Number(e.target.value))}
                                                className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold text-foreground placeholder:text-gray-400"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500 mb-2 block">When? (Month {simMonthOffset + 1})</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="11"
                                                step="1"
                                                value={simMonthOffset}
                                                onChange={(e) => setSimMonthOffset(Number(e.target.value))}
                                                className="w-full accent-primary"
                                            />
                                            <div className="flex justify-between text-xs font-semibold text-gray-400 mt-2">
                                                <span>Now</span>
                                                <span>In 1 Year</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-secondary/10 border border-secondary/20 rounded-[24px] p-6 mt-6">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">Impact Analysis</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-blue-800">
                                                <span>End of Yr (Base):</span>
                                                <span className="font-semibold">₹{(finalBaseline / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between text-blue-800">
                                                <span>End of Yr (Sim):</span>
                                                <span className="font-semibold">₹{(finalSimulated / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="pt-2 mt-2 border-t border-blue-200 flex justify-between text-blue-900 font-bold">
                                                <span>Recovery Time:</span>
                                                <span>~{recoveryMonths} Months</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulator Chart */}
                                <div className="lg:w-2/3 xl:w-3/4 flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h4 className="font-semibold text-xl text-gray-500">12-Month Trajectory</h4>
                                        <div className="flex items-center gap-4 text-sm font-semibold">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                                <span className="text-gray-500">Baseline Rate</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"></div>
                                                <span className="text-foreground">With Purchase</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-h-[300px] w-full relative">
                                        {/* Chart styling mimicking Dashboard */}
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 600 }}
                                                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                                                    dx={-10}
                                                    width={60}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Net Worth']}
                                                    labelStyle={{ color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="baseline"
                                                    stroke="#9CA3AF"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorBaseline)"
                                                    name="Baseline"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="simulated"
                                                    stroke="var(--color-primary)"
                                                    strokeWidth={4}
                                                    fillOpacity={1}
                                                    fill="url(#colorSimulated)"
                                                    name="Simulated Path"
                                                    activeDot={{ r: 8, fill: "var(--color-primary)", strokeWidth: 0, style: { filter: "drop-shadow(0px 0px 8px var(--color-primary))" } }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>

                                        {/* Purchase marker overlay */}
                                        <div
                                            className="absolute top-0 bottom-6 border-l-2 border-dashed border-red-400 z-10 pointer-events-none flex flex-col justify-between items-center transition-all duration-300"
                                            style={{ left: `${(simMonthOffset / 11) * 91 + 5}%` }}
                                        >
                                            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm translate-y-2 whitespace-nowrap">
                                                -{simPurchaseAmount >= 100000 ? `${(simPurchaseAmount / 100000).toFixed(1)}L` : simPurchaseAmount.toLocaleString()} Purchase
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>

                {/* Add Subscription Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] shadow-soft-lg w-full max-w-md overflow-hidden animation-scale-in">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-xl text-foreground">Add Subscription</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddSubscription} className="p-8 space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Service Name</label>
                                    <input required type="text" value={subName} onChange={(e) => setSubName(e.target.value)} className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold" placeholder="e.g. Netflix, Spotify" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Monthly Amount (₹)</label>
                                    <input required type="number" value={subAmount} onChange={(e) => setSubAmount(e.target.value)} className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold" placeholder="0.00" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 mb-2 block">Category</label>
                                        <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold cursor-pointer">
                                            <option value="Software">Software</option>
                                            <option value="Services">Services</option>
                                            <option value="Infrastructure">Infrastructure</option>
                                            <option value="Entertainment">Entertainment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 mb-2 block">Usage level</label>
                                        <select value={subUsage} onChange={(e) => setSubUsage(e.target.value)} className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold cursor-pointer">
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-all shadow-soft hover:shadow-soft-lg mt-4">
                                    Track Subscription
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
