"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    Search,
    Filter,
    Download,
    X,
    Receipt,
    Sparkles,
    ArrowRight,
    ArrowRightLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Transaction {
    id: string;
    date: string;
    description: string;
    category_prices?: Record<string, number>;
    category?: string; // Kept for backwards compatibility just in case
    amount: number;
    status: "Completed" | "Pending";
}

const initialTransactions: Transaction[] = [
    { id: "TXN-001", date: "2026-02-21", description: "Product Sale - Premium Plan", category_prices: { "Sales": 1250.00 }, amount: 1250.00, status: "Completed" },
    { id: "TXN-002", date: "2026-02-20", description: "AWS Hosting", category_prices: { "Infrastructure": -150.00 }, amount: -150.00, status: "Completed" },
    { id: "TXN-003", date: "2026-02-18", description: "Marketing Campaign (FB)", category_prices: { "Marketing": -450.00 }, amount: -450.00, status: "Completed" },
    { id: "TXN-004", date: "2026-02-15", description: "Consulting Services", category_prices: { "Services": 3000.00 }, amount: 3000.00, status: "Completed" },
    { id: "TXN-005", date: "2026-02-12", description: "Software Subscriptions", category_prices: { "Software": -299.99 }, amount: -299.99, status: "Completed" },
    { id: "TXN-006", date: "2026-02-10", description: "Product Sale - Basic Plan", category_prices: { "Sales": 250.00 }, amount: 250.00, status: "Completed" },
    { id: "TXN-007", date: "2026-02-05", description: "Office Supplies", category_prices: { "Other": -55.50 }, amount: -55.50, status: "Completed" },
    { id: "TXN-008", date: "2026-02-01", description: "Monthly Retainer", category_prices: { "Services": 5000.00 }, amount: 5000.00, status: "Completed" },
];

const COLORS = ['#703EFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export function LedgerClient() {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<HTMLDivElement>(null);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

    // Custom categories state
    const [customCategories, setCustomCategories] = useState<string[]>([
        "Sales", "Infrastructure", "Marketing", "Software", "Services", "Other", "Food"
    ]);
    const [newCategory, setNewCategory] = useState("");

    // Form state
    const [desc, setDesc] = useState("");
    const [amt, setAmt] = useState("");
    const [cat, setCat] = useState("Sales");

    // Filter & Sort state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"All" | "Pending">("All");
    const [sortField, setSortField] = useState<"date" | "amount" | null>("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        setTransactions(initialTransactions);
        const storedCats = localStorage.getItem("customCategories");
        if (storedCats) {
            try {
                setCustomCategories(JSON.parse(storedCats));
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        gsap.fromTo(
            viewRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.out" }
        );

        if (containerRef.current) {
            const elements = containerRef.current.children;
            gsap.fromTo(
                elements,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.2 }
            );
        }
    }, []);

    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

    const handleAddCategory = () => {
        if (!newCategory.trim() || customCategories.includes(newCategory.trim())) return;
        const updated = [...customCategories, newCategory.trim()];
        setCustomCategories(updated);
        localStorage.setItem("customCategories", JSON.stringify(updated));
        setNewCategory("");
    };

    const handleRemoveCategory = (catToRemove: string) => {
        const updated = customCategories.filter(c => c !== catToRemove);
        setCustomCategories(updated);
        localStorage.setItem("customCategories", JSON.stringify(updated));
        // Reset default cat if it was removed
        if (cat === catToRemove) {
            setCat(updated.length > 0 ? updated[0] : "");
        }
    };

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!desc || !amt || !cat) return;

        const numAmt = parseFloat(amt);
        const newTxn: Transaction = {
            id: `TXN-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            description: desc,
            category_prices: { [cat]: numAmt },
            amount: numAmt,
            status: "Completed"
        };

        setTransactions([newTxn, ...transactions]);
        setIsAddModalOpen(false);
        setDesc("");
        setAmt("");
    };

    // Derived Data for Charts
    const cashFlowData = [...transactions].reduce((acc, txn) => {
        const existing = acc.find(item => item.date === txn.date);
        if (existing) {
            if (txn.amount > 0) existing.income += txn.amount;
            else existing.expense += Math.abs(txn.amount);
        } else {
            acc.push({
                date: txn.date,
                income: txn.amount > 0 ? txn.amount : 0,
                expense: txn.amount < 0 ? Math.abs(txn.amount) : 0
            });
        }
        return acc;
    }, [] as { date: string, income: number, expense: number }[])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const expenseBreakdownData = transactions
        .filter(t => t.amount < 0 && t.category_prices)
        .reduce((acc, txn) => {
            if (!txn.category_prices) return acc;

            Object.entries(txn.category_prices).forEach(([categoryName, amount]) => {
                // LLM might have returned positive amounts for expenses, or negative.
                // We'll trust our overarching t.amount sign or Math.abs it.
                const fallbackAmount = Math.abs(amount);
                const existing = acc.find(item => item.name === categoryName);
                if (existing) {
                    existing.value += fallbackAmount;
                } else {
                    acc.push({ name: categoryName, value: fallbackAmount });
                }
            });
            return acc;
        }, [] as { name: string, value: number }[])
        .sort((a, b) => b.value - a.value);

    // Filtered & Sorted Transactions
    const filteredAndSortedTransactions = [...transactions]
        .filter(t => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = t.description.toLowerCase().includes(searchLower) ||
                t.id.toLowerCase().includes(searchLower) ||
                (t.category_prices && Object.keys(t.category_prices).some(cat => cat.toLowerCase().includes(searchLower))) ||
                (t.category && t.category.toLowerCase().includes(searchLower));

            const matchesType = filterType === "All" ? true :
                t.status === "Pending";

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (!sortField) return 0;
            if (sortField === "date") {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            } else if (sortField === "amount") {
                return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
            }
            return 0;
        });

    const handleSort = (field: "date" | "amount") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    return (
        <div ref={viewRef} className="flex h-screen overflow-hidden bg-gray-50/30">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
                <Header />

                <main
                    ref={containerRef}
                    className="flex-1 p-8 lg:p-12 space-y-8 max-w-[1600px] mx-auto w-full"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border/50">
                        <div>
                            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Financials</p>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                Ledger & Bookkeeping
                            </h1>
                            <p className="text-gray-500 mt-2">Track income, expenses, and overall balance.</p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                onClick={() => setIsCategoriesModalOpen(true)}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white text-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all border border-border shadow-sm text-sm"
                            >
                                <Filter className="w-4 h-4 text-gray-400" /> Categories
                            </motion.button>
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white text-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all border border-border shadow-sm text-sm"
                            >
                                <Download className="w-4 h-4 text-gray-400" /> Export CSV
                            </motion.button>
                            <motion.button
                                onClick={() => setIsAddModalOpen(true)}
                                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(112,62,255,0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-accent text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-accent/90 transition-all shadow-md shadow-accent/20 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Entry
                            </motion.button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border/60 hover:border-accent/30 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                <Wallet className="w-24 h-24" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Balance</p>
                                <h2 className="text-4xl font-bold tracking-tight text-foreground">₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border/60 hover:border-green-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                    <ArrowUpRight className="w-3 h-3" /> +14%
                                </span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Income (Monthly)</p>
                                <h2 className="text-3xl font-bold tracking-tight text-foreground">₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border/60 hover:border-red-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                <TrendingDown className="w-24 h-24" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Expenses (Monthly)</p>
                                <h2 className="text-3xl font-bold tracking-tight text-foreground">₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Analytics & Insights Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Cash Flow Chart */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] border border-border/60 shadow-sm p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Cash Flow Trend</h2>
                                    <p className="text-sm text-gray-500">Income vs Expenses over time</p>
                                </div>
                                <select className="bg-gray-50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/20">
                                    <option>Last 30 Days</option>
                                    <option>Last Quarter</option>
                                    <option>This Year</option>
                                </select>
                            </div>
                            <div className="flex-1 min-h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]}
                                        />
                                        <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Insights & Expense Breakdown */}
                        <div className="flex flex-col gap-5">
                            {/* AI Insight Card */}
                            <div className="bg-linear-to-br from-accent/10 to-purple-500/5 rounded-[24px] border border-accent/20 shadow-sm p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles className="w-16 h-16 text-accent" />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                    <h3 className="font-bold text-transparent bg-clip-text bg-linear-to-r from-accent to-purple-600">Smart Insight</h3>
                                </div>
                                <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
                                    Your <strong>Marketing</strong> expenses have increased by 15% this month compared to the last average.
                                    However, total Income remains strong, projecting a <strong>₹4,500+</strong> surplus by month-end.
                                </p>
                                <button className="text-xs font-bold text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View Detailed Forecast <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Expense Breakdown */}
                            <div className="bg-white rounded-[24px] border border-border/60 shadow-sm p-6 flex-1 flex flex-col">
                                <h3 className="text-sm font-bold text-foreground mb-4">Expense Breakdown</h3>
                                {expenseBreakdownData.length > 0 ? (
                                    <div className="flex-1 flex flex-col justify-center relative">
                                        <div className="h-[140px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={expenseBreakdownData}
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {expenseBreakdownData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 space-y-2 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                            {expenseBreakdownData.map((entry, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                        <span className="text-gray-600 font-medium truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-foreground">₹{entry.value.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                                        No expenses recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table Section */}
                    <div className="bg-white rounded-[24px] border border-border/60 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-accent" /> Recent Transactions
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search ledger..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="py-2 pl-9 pr-4 text-sm bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all w-64"
                                    />
                                </div>
                                <div className="relative flex items-center bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm">
                                    <Filter className="w-4 h-4 text-gray-400 mr-2" />
                                    <select
                                        className="bg-transparent outline-none cursor-pointer text-gray-600 font-medium"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as any)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-border/50">
                                        <th className="px-6 py-4">Transaction ID</th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-accent select-none" onClick={() => handleSort("date")}>
                                            <div className="flex items-center gap-1">
                                                Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right cursor-pointer hover:text-accent select-none" onClick={() => handleSort("amount")}>
                                            <div className="flex items-center justify-end gap-1">
                                                Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredAndSortedTransactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-foreground bg-gray-100 px-2 py-1 rounded-md">{txn.id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {txn.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-foreground">{txn.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {txn.category_prices ? Object.keys(txn.category_prices).map(catName => (
                                                        <span key={catName} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                            {catName}
                                                        </span>
                                                    )) : (
                                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                            {txn.category || "Uncategorized"}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-xs font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-sm font-bold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {txn.amount >= 0 ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAndSortedTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                                No transactions match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* Add Transaction Modal */}
                <AnimatePresence>
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                                onClick={() => setIsAddModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white border border-border rounded-[24px] shadow-2xl p-8 w-full max-w-md z-10 mx-4"
                            >
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Add Ledger Entry</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Record a new transaction</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddTransaction} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={amt}
                                            onChange={(e) => setAmt(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full text-lg font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Description</label>
                                        <input
                                            type="text"
                                            value={desc}
                                            onChange={(e) => setDesc(e.target.value)}
                                            placeholder="e.g. Server costs, Product Sale"
                                            className="w-full text-sm font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Category</label>
                                        <select
                                            value={cat}
                                            onChange={(e) => setCat(e.target.value)}
                                            className="w-full text-sm font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
                                        >
                                            {customCategories.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-all shadow-md shadow-accent/20 mt-2"
                                    >
                                        Save Transaction
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )
                    }
                </AnimatePresence >

                {/* Categories Management Modal */}
                <AnimatePresence>
                    {isCategoriesModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                                onClick={() => setIsCategoriesModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white border border-border rounded-[24px] shadow-2xl p-8 w-full max-w-md z-10 mx-4"
                            >
                                <button
                                    onClick={() => setIsCategoriesModalOpen(false)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <Filter className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Manage Categories</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Customize your ledger categorization</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="New Category Name"
                                            className="flex-1 text-sm font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        />
                                        <button
                                            onClick={handleAddCategory}
                                            className="bg-accent text-white px-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-4 border border-border/80 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                                        {customCategories.length > 0 ? (
                                            <ul className="divide-y divide-border/50">
                                                {customCategories.map((c) => (
                                                    <li key={c} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                                        <span className="text-sm font-medium text-gray-700">{c}</span>
                                                        <button
                                                            onClick={() => handleRemoveCategory(c)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="p-4 text-center text-sm text-gray-500">No categories defined.</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}
