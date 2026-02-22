"use client";

import React, { useRef, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import gsap from "gsap";
import { Header } from "./Header";
import {
    TrendingUp,
    TrendingDown,
    PiggyBank,
    CreditCard,
    ArrowRight,
    Landmark,
    Wallet,
    Receipt
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { useFinance, Transaction } from "@/context/FinanceContext";

export function DashboardClient() {
    const { transactions, accounts, budgets } = useFinance();
    const viewRef = useRef<HTMLDivElement>(null);

    // --- Dynamic Calculations ---

    // 1. Net Worth (Total balance across all accounts)
    const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 2. Total Assets (Cash + Digital Assets)
    const totalAssets = accounts.filter(a => a.type !== 'Credit Card').reduce((sum, a) => sum + a.balance, 0);

    // 3. Total Liabilities (Credit Cards)
    const totalLiabilities = Math.abs(accounts.filter(a => a.type === 'Credit Card').reduce((sum, a) => sum + a.balance, 0));

    // 4. Monthly Income/Expenses (Dynamic based on last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPeriodTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    const previousPeriodTransactions = transactions.filter(t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo);

    const calcTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const percent = ((current - previous) / previous) * 100;
        return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
    };

    const monthlyIncome = currentPeriodTransactions.filter(t => t.amount > 0).reduce((sym, t) => sym + t.amount, 0);
    const prevIncome = previousPeriodTransactions.filter(t => t.amount > 0).reduce((sym, t) => sym + t.amount, 0);
    const incomeTrend = calcTrend(monthlyIncome, prevIncome);

    const monthlyExpenses = currentPeriodTransactions.filter(t => t.amount < 0).reduce((sym, t) => sym + Math.abs(t.amount), 0);
    const prevExpenses = previousPeriodTransactions.filter(t => t.amount < 0).reduce((sym, t) => sym + Math.abs(t.amount), 0);
    const expenseTrend = calcTrend(monthlyExpenses, prevExpenses);

    const netCashFlow = monthlyIncome - monthlyExpenses;
    const cashFlowText = transactions.length === 0
        ? "Connect your accounts and start tracking transactions to see your financial health."
        : netCashFlow > 0
            ? `Cash flow is positive this period with a net surplus of ₹${netCashFlow.toLocaleString()}.`
            : `You spent ₹${Math.abs(netCashFlow).toLocaleString()} more than your income this period.`;

    // 5. Cash Flow Area Chart Data
    // Group by date (simplified aggregation)
    const cashFlowMap = new Map();
    transactions.forEach(txn => {
        const date = new Date(txn.date).toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
        if (!cashFlowMap.has(date)) {
            cashFlowMap.set(date, { date, income: 0, expenses: 0 });
        }
        const current = cashFlowMap.get(date);
        if (txn.amount > 0) current.income += txn.amount;
        else current.expenses += Math.abs(txn.amount);
    });
    // Array format for Recharts
    const cashFlowPerformance = Array.from(cashFlowMap.values()).reverse(); // Reverse to read chronologically loosely

    // 6. Top Spending Categories
    const categoryTotals = transactions.filter(t => t.amount < 0).reduce((acc, txn) => {
        acc[txn.category] = (acc[txn.category] || 0) + Math.abs(txn.amount);
        return acc;
    }, {} as Record<string, number>);

    const topSpendingCategories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: Math.min((amount / monthlyExpenses) * 100, 100).toFixed(0) + '%'
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3); // Top 3

    // 7. Recent Transactions (Top 5)
    const recentTransactions = transactions.slice(0, 5);

    useEffect(() => {
        if (viewRef.current) {
            gsap.fromTo(
                viewRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div className="flex bg-background h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Clean background area */}

                <Header />

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pt-8 pb-32 lg:pb-20 custom-scrollbar z-0 w-full relative">
                    <div ref={viewRef} className="max-w-6xl mx-auto space-y-12">

                        {/* 1. Net Worth Summary */}
                        <div className="bg-white border border-gray-100 shadow-soft p-8 md:p-12 relative overflow-hidden rounded-[32px]">
                            <div className="absolute right-0 bottom-0 p-8 opacity-5 pointer-events-none">
                                <Landmark className="w-72 h-72 text-gray-900 translate-x-12 translate-y-12" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-500 tracking-tight mb-2">Total Net Worth</h1>
                                    <div className="flex items-baseline gap-4 mt-2">
                                        <h2 className="text-[64px] font-bold text-gray-900 tracking-tight leading-none">₹{netWorth.toLocaleString()}</h2>
                                        <span className="inline-flex items-center text-xs font-bold font-space uppercase text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            +4.2% Since last month
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium mt-6 max-w-lg">
                                        Your overall financial health across all connected accounts. {cashFlowText}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <button className="bg-black text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-gray-800 shadow-soft hover:shadow-soft-lg transition-all" onClick={() => window.location.href = '/ledger'}>
                                        View Ledger
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Quick Finance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "Net Balance", value: `₹${netWorth.toLocaleString()}`, trend: "Live Data", isPositive: true, icon: Landmark, cardColor: "bg-white", iconBg: "bg-gray-50 text-gray-700" },
                                { title: "30-Day Income", value: `₹${monthlyIncome.toLocaleString()}`, trend: incomeTrend, isPositive: parseFloat(incomeTrend) >= 0, icon: TrendingUp, cardColor: "bg-white", iconBg: "bg-accent/30 text-green-700" },
                                { title: "30-Day Expenses", value: `₹${monthlyExpenses.toLocaleString()}`, trend: expenseTrend, isPositive: parseFloat(expenseTrend) <= 0, icon: TrendingDown, cardColor: "bg-white", iconBg: "bg-red-50 text-red-600" },
                            ].map((stat, i) => (
                                <div key={i} className={`${stat.cardColor} border border-gray-100 shadow-soft p-6 rounded-[32px] hover:shadow-soft-lg transition-all duration-300 relative overflow-hidden`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center transition-all duration-300`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                            {/* 3. Cash Flow Chart */}
                            <div className="xl:col-span-2 bg-white border border-gray-100 shadow-soft p-8 rounded-[32px]">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Cash Flow</h3>
                                        <p className="text-xs font-medium text-gray-500 mt-1">Income vs Expenses (Simulated Range)</p>
                                    </div>
                                    <select className="bg-gray-50 border-none text-sm font-semibold rounded-full px-4 py-2 outline-none cursor-pointer hover:bg-gray-100 transition-colors">
                                        <option>Last 7 days</option>
                                        <option>Last 30 days</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                                <div className="h-[280px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={cashFlowPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: '500' }} tickLine={false} axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontWeight: '500' }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]}
                                            />
                                            <Area type="monotone" dataKey="income" name="Income" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 4. Top Spending Categories */}
                            <div className="bg-white border border-gray-100 shadow-soft p-8 flex flex-col rounded-[32px]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Spent</h3>
                                    <button className="bg-gray-50 text-gray-500 p-2 rounded-full hover:bg-gray-100 hover:text-black transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col gap-4">
                                    {topSpendingCategories.map((category, i) => {
                                        const COLORS = ['#000000', '#D1D5DB', '#E8FCC1'];
                                        const color = COLORS[i % COLORS.length];
                                        return (
                                            <div key={i} className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                                            <Receipt className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-gray-900 truncate">{category.name}</h4>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">₹{category.amount.toLocaleString()}</p>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: category.percentage, backgroundColor: color }}></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 5. Recent Transactions */}
                        <div className="bg-white border border-gray-100 shadow-soft p-8 rounded-[32px] mt-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Transactions</h3>
                                <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-2" onClick={() => window.location.href = '/ledger'}>
                                    Go to Ledger <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6">
                                            <th className="px-6 py-2">Entity / Description</th>
                                            <th className="px-6 py-2">Category</th>
                                            <th className="px-6 py-2">Status</th>
                                            <th className="px-6 py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-0">
                                        {recentTransactions.map((txn, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-all group rounded-2xl">
                                                <td className="px-6 py-4 bg-gray-50/30 first:rounded-l-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${txn.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                            {txn.amount > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 line-clamp-1">{txn.description}</span>
                                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">{new Date(txn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 bg-gray-50/30">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
                                                        {txn.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 bg-gray-50/30">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></span>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 bg-gray-50/30 last:rounded-r-2xl text-right">
                                                    <span className={`font-space font-bold text-base ${txn.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                        {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {transactions.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <Receipt className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-500 font-semibold text-sm">No transactions found.</p>
                                    <button className="mt-4 text-primary text-xs font-bold hover:underline" onClick={() => window.location.href = '/ledger'}>Add your first entry &rarr;</button>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
