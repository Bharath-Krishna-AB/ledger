"use client";

import React, { useRef, useEffect, useState } from "react";
import { Sidebar } from "../Sidebar";
import gsap from "gsap";
import { Header } from "../Header";
import {
    Plus,
    CreditCard,
    Building2,
    Wallet,
    Landmark,
    MoreHorizontal,
    X
} from "lucide-react";

import { useFinance, Account } from "@/context/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";

export function AccountsClient() {
    const { accounts, addAccount, deleteAccount, getIconComponent } = useFinance();
    const viewRef = useRef<HTMLDivElement>(null);

    // Add Account State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [accName, setAccName] = useState("");
    const [accType, setAccType] = useState<"Checking" | "Savings" | "Credit Card" | "Digital Asset">("Checking");
    const [accBalance, setAccBalance] = useState("");

    useEffect(() => {
        if (viewRef.current) {
            gsap.fromTo(
                viewRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, [accounts]);

    // Calculate Totals
    const totalCash = accounts.filter(a => a.type === "Checking" || a.type === "Savings").reduce((sum, a) => sum + a.balance, 0);
    const totalCredit = accounts.filter(a => a.type === "Credit Card").reduce((sum, a) => sum + a.balance, 0);
    const totalAssets = accounts.filter(a => a.type === "Digital Asset").reduce((sum, a) => sum + a.balance, 0);

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accName || !accBalance) return;

        let iconName = "Building2";
        let color = "text-blue-600";
        let bg = "bg-blue-100";

        if (accType === "Savings") { iconName = "Landmark"; color = "text-green-600"; bg = "bg-green-100"; }
        if (accType === "Credit Card") { iconName = "CreditCard"; color = "text-gray-800"; bg = "bg-gray-200"; }
        if (accType === "Digital Asset") { iconName = "Wallet"; color = "text-purple-600"; bg = "bg-purple-100"; }

        addAccount({
            name: accName,
            type: accType,
            balance: parseFloat(accBalance),
            currency: "₹",
            iconName,
            color,
            bg
        });

        setIsAddModalOpen(false);
        setAccName("");
        setAccBalance("");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/30">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Background ambient accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

                <Header />

                <main className="flex-1 overflow-y-auto px-10 pt-8 pb-20 custom-scrollbar z-0">
                    <div ref={viewRef} className="max-w-6xl mx-auto space-y-8">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Accounts & Wallets</h1>
                                <p className="text-gray-500">Manage your connected banks, credit cards, and digital assets.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold text-sm hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Account
                            </button>
                        </div>

                        {/* Quick Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border border-border rounded-[20px] p-6 shadow-sm">
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Cash</p>
                                <h3 className="text-2xl font-bold text-foreground">₹{totalCash.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white border border-border rounded-[20px] p-6 shadow-sm">
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Credit Liability</p>
                                <h3 className="text-2xl font-bold text-red-600">₹{Math.abs(totalCredit).toLocaleString()}</h3>
                            </div>
                            <div className="bg-white border border-border rounded-[20px] p-6 shadow-sm">
                                <p className="text-sm font-medium text-gray-500 mb-1">Digital Assets</p>
                                <h3 className="text-2xl font-bold text-purple-600">₹{totalAssets.toLocaleString()}</h3>
                            </div>
                        </div>

                        {/* Accounts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                            {accounts.map((acc, i) => {
                                const IconComponent = getIconComponent(acc.iconName);
                                return (
                                    <div key={acc.id} className="bg-white border border-border rounded-[24px] shadow-sm hover:shadow-md transition-shadow p-6 group relative overflow-hidden flex flex-col h-full cursor-pointer hover:border-accent/40">
                                        <div className="absolute top-4 right-4 flex gap-1 z-10 transition-opacity opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                                title="Delete Account"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-foreground p-1.5 rounded-full transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${acc.bg} ${acc.color}`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground leading-tight">{acc.name}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{acc.type}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-border/50">
                                            <p className="text-sm text-gray-500 mb-1">{acc.type === 'Credit Card' ? 'Current Balance' : 'Available Balance'}</p>
                                            <div className="flex items-end justify-between">
                                                <h4 className={`text-2xl font-bold ${acc.balance < 0 ? 'text-red-600' : 'text-foreground'}`}>
                                                    {acc.currency}{Math.abs(acc.balance).toLocaleString()}
                                                </h4>
                                                {acc.limit && (
                                                    <p className="text-xs font-semibold text-gray-400 pb-1">/ {acc.currency}{acc.limit.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Action */}
                                        <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-6 pointer-events-none group-hover:pointer-events-auto">
                                            <button className="w-full bg-gray-100 hover:bg-gray-200 text-foreground py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                                View Details
                                            </button>
                                            <button className="w-full bg-accent hover:bg-accent/90 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                                Transfer Funds
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Add New Card Placeholder */}
                            <div
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center p-8 text-gray-400 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all cursor-pointer min-h-[220px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Add New Account</h3>
                                <p className="text-sm text-center max-w-[200px]">Connect a bank, credit card, or wallet.</p>
                            </div>
                        </div>

                    </div>
                </main>

                {/* Add Account Modal */}
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
                                    ✕
                                </button>

                                <div className="mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">Add Account</h2>
                                        <p className="text-sm text-gray-500">Track a new bank or wallet</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddAccount} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Account Name</label>
                                        <input
                                            type="text"
                                            value={accName}
                                            onChange={(e) => setAccName(e.target.value)}
                                            placeholder="e.g. Chase Checkings"
                                            className="w-full text-sm font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Account Type</label>
                                        <select
                                            value={accType}
                                            onChange={(e) => setAccType(e.target.value as any)}
                                            className="w-full text-sm font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
                                        >
                                            <option value="Checking">Checking</option>
                                            <option value="Savings">Savings</option>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="Digital Asset">Digital Asset</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Current Balance (₹)</label>
                                        <input
                                            type="number"
                                            value={accBalance}
                                            onChange={(e) => setAccBalance(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full text-lg font-medium p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-all shadow-md mt-4"
                                    >
                                        Save Account
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
