"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Search, Bell, Menu, LogOut, X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/login/actions";
import { useFinance, Transaction, Budget } from "@/context/FinanceContext";

interface AppNotification {
    id: string;
    title: string;
    description: string;
    type: "alert" | "info" | "success";
    date?: string;
}

export function Header() {
    const headerRef = useRef<HTMLElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);
    const supabase = createClient();
    const { budgets, transactions } = useFinance();

    useEffect(() => {
        gsap.fromTo(
            headerRef.current,
            { y: -10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Close dropdown when clicked outside
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [supabase.auth]);

    // Compute notifications dynamically
    const budgetNotifs: AppNotification[] = budgets
        .filter((b: Budget) => b.overBudget)
        .map((b: Budget) => ({
            id: `bgt-${b.id}`,
            title: "Budget Exceeded",
            description: `You have exceeded your budget limit for ${b.name}.`,
            type: "alert"
        }));

    const txnNotifs: AppNotification[] = transactions
        .slice(0, 3)
        .map((t: Transaction) => ({
            id: `txn-${t.id}`,
            title: t.type === "Income" ? "New Income" : "New Expense",
            description: `${t.description} - $${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            type: t.type === "Income" ? "success" : "info",
            date: t.date
        }));

    // Combine and filter out dismissed
    const allNotifs = [...budgetNotifs, ...txnNotifs].filter(n => !dismissedNotifs.includes(n.id));

    const dismissNotif = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDismissedNotifs(prev => [...prev, id]);
    };

    const dismissAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDismissedNotifs(prev => [...prev, ...allNotifs.map(n => n.id)]);
    };

    return (
        <header
            ref={headerRef}
            className="h-24 w-full flex items-center justify-between px-8 bg-transparent z-10 sticky top-0"
        >
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-400 hover:text-black transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for metrics or settings..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white shadow-soft rounded-full text-sm text-black outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen((prev) => !prev)}
                        className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${isNotifOpen ? 'bg-gray-100 text-black shadow-inner' : 'bg-white shadow-soft hover:shadow-soft-lg text-gray-500 hover:text-black'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {allNotifs.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {isNotifOpen && (
                        <div className="absolute top-full mt-3 right-0 w-80 bg-white/70 backdrop-blur-xl shadow-soft-xl rounded-2xl border border-white/50 overflow-hidden z-50 transition-all duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-100/50 flex items-center justify-between bg-white/50">
                                <h3 className="font-semibold text-sm text-black">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {allNotifs.length} new
                                    </span>
                                </div>
                            </div>

                            <div className="max-h-[340px] overflow-y-auto w-full custom-scrollbar">
                                {allNotifs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                                        <Bell className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full">
                                        {allNotifs.map((notif: AppNotification) => (
                                            <div key={notif.id} className="p-4 border-b border-gray-50/50 hover:bg-white/60 transition-colors flex gap-3 group relative cursor-pointer">
                                                <div className="mt-0.5 shrink-0">
                                                    {notif.type === 'alert' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                                    {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                    {notif.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{notif.description}</p>
                                                    {notif.date && (
                                                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                                            {new Date(notif.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => dismissNotif(notif.id, e)}
                                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-700"
                                                    title="Dismiss"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {allNotifs.length > 0 && (
                                <div className="p-2 border-t border-gray-100/50 bg-white/50">
                                    <button
                                        onClick={dismissAll}
                                        className="w-full py-2 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-100/80 rounded-xl transition-all"
                                    >
                                        Dismiss All
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 bg-white shadow-soft rounded-full pl-3 pr-1 py-1 border border-gray-50">
                    <div className="text-right hidden sm:block px-2">
                        <p className="text-sm font-semibold text-black leading-tight max-w-[120px] truncate">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            {user ? "Pro User" : "Visitor"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                <span className="text-white text-xs font-bold font-kol">
                                    {user?.user_metadata?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || "G"}
                                </span>
                            </div>
                        )}

                        {user && (
                            <button
                                onClick={async () => {
                                    setUser(null);
                                    await signOut();
                                }}
                                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

