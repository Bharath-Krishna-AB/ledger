"use client";

import React, { useRef, useEffect, useState } from "react";
import { Sidebar } from "../Sidebar";
import gsap from "gsap";
import { Header } from "../Header";
import {
    Plus,
    Target,
    TrendingUp,
    Coffee,
    MonitorSmartphone,
    Home as HomeIcon,
    Plane,
    ShoppingBag,
    X
} from "lucide-react";

import { useFinance } from "@/context/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";

export function BudgetsClient() {
    const { budgets, goals, addBudget, addGoal, deleteBudget, deleteGoal, getIconComponent } = useFinance();
    const viewRef = useRef<HTMLDivElement>(null);

    // Create Budget State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [budgetName, setBudgetName] = useState("");
    const [budgetAllocated, setBudgetAllocated] = useState("");
    const [budgetCategory, setBudgetCategory] = useState("Housing");
    const [goalName, setGoalName] = useState("");
    const [goalTargetAmount, setGoalTargetAmount] = useState("");

    useEffect(() => {
        if (viewRef.current) {
            gsap.fromTo(
                viewRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, [budgets]);

    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const overallPercentage = totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0;

    const handleAddBudget = (e: React.FormEvent) => {
        e.preventDefault();
        if (!budgetName || !budgetAllocated) return;

        let iconName = "Target";
        let color = "text-black";
        let bg = "bg-kol-gray";
        let bar = "bg-black";

        if (budgetCategory === "Housing") { iconName = "HomeIcon"; color = "text-black"; bg = "bg-kol-blue"; bar = "bg-black"; }
        if (budgetCategory === "Food") { iconName = "Coffee"; color = "text-black"; bg = "bg-kol-pink"; bar = "bg-black"; }
        if (budgetCategory === "Tech") { iconName = "MonitorSmartphone"; color = "text-black"; bg = "bg-kol-yellow"; bar = "bg-black"; }
        if (budgetCategory === "Travel") { iconName = "Plane"; color = "text-black"; bg = "bg-kol-green"; bar = "bg-black"; }
        if (budgetCategory === "Shopping") { iconName = "ShoppingBag"; color = "text-black"; bg = "bg-kol-pink"; bar = "bg-black"; }

        addBudget({
            name: budgetName,
            allocated: parseFloat(budgetAllocated),
            iconName,
            color,
            bg,
            bar
        });

        setIsAddModalOpen(false);
        setBudgetName("");
        setBudgetAllocated("");
    };

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalName || !goalTargetAmount) return;

        addGoal({
            name: goalName,
            target_amount: parseFloat(goalTargetAmount),
            icon_name: "Target",
            color: "text-black",
            bg: "bg-kol-blue"
        });

        setIsAddGoalModalOpen(false);
        setGoalName("");
        setGoalTargetAmount("");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>
                <Header />

                <main className="flex-1 overflow-y-auto px-6 lg:px-12 pt-8 pb-20 custom-scrollbar z-0">
                    <div ref={viewRef} className="max-w-7xl mx-auto space-y-10">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
                                    <Target className="w-8 h-8 text-primary" />
                                    Budgets & Goals
                                </h1>
                                <p className="text-gray-500">
                                    Track your monthly spending limits and savings targets.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsAddGoalModalOpen(true)}
                                    className="bg-white text-foreground border border-gray-100 px-6 py-3 rounded-full text-sm font-semibold hover:-translate-y-0.5 hover:shadow-soft-lg transition-all shadow-soft flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Goal
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:-translate-y-0.5 hover:shadow-soft-lg transition-all shadow-soft flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Budget
                                </button>
                            </div>
                        </div>

                        {/* Overview Card */}
                        <div className="bg-white border border-gray-100 rounded-[32px] shadow-soft p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                            <div className="flex-1 w-full relative z-10">
                                <h3 className="font-semibold text-xl text-gray-500 mb-8">Monthly Overview (October)</h3>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-4xl font-bold text-foreground tracking-tight">₹{totalSpent.toLocaleString()}</p>
                                        <p className="text-sm font-semibold text-gray-500 mt-2">spent of ₹{totalAllocated.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-3xl font-bold tracking-tight ${totalRemaining < 0 ? 'text-red-500' : 'text-primary'}`}>
                                            {totalRemaining < 0 ? '-' : ''}₹{Math.abs(totalRemaining).toLocaleString()}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-500 mt-2">remaining</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 mt-6 overflow-hidden relative">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${overallPercentage > 90 ? 'bg-red-500' : 'bg-primary'}`}
                                        style={{ width: `${overallPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Budgets Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                            {budgets.map((budget, i) => {
                                const percentage = budget.allocated > 0 ? Math.min((budget.spent / budget.allocated) * 100, 100) : 0;
                                const isWarning = percentage > 85 && !budget.overBudget;
                                const IconComponent = getIconComponent(budget.iconName);

                                let finalBg = budget.bg;
                                if (finalBg === 'bg-blue-100' || finalBg === 'bg-kol-blue') finalBg = 'bg-blue-50';
                                else if (finalBg === 'bg-orange-100' || finalBg === 'bg-kol-yellow') finalBg = 'bg-orange-50';
                                else if (finalBg === 'bg-purple-100' || finalBg === 'bg-kol-pink') finalBg = 'bg-purple-50';
                                else if (finalBg === 'bg-green-100' || finalBg === 'bg-kol-green') finalBg = 'bg-green-50';
                                else if (finalBg === 'bg-pink-100' || finalBg === 'bg-kol-pink') finalBg = 'bg-pink-50';
                                else finalBg = 'bg-gray-50';

                                return (
                                    <div key={budget.id} className="group bg-white border border-gray-100 rounded-[32px] shadow-soft hover:-translate-y-1 hover:shadow-soft-lg transition-all p-8 flex flex-col h-full cursor-pointer relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteBudget(budget.id); }}
                                            className="absolute -top-3 -right-3 bg-white text-red-500 p-2 border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-20 shadow-soft rounded-full"
                                            title="Delete Budget"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${finalBg} text-gray-600`}>
                                                    <IconComponent className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-xl text-foreground tracking-tight">{budget.name}</h3>
                                            </div>
                                            {budget.overBudget && (
                                                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Over</span>
                                            )}
                                            {isWarning && (
                                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">Near Limit</span>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex justify-between items-end mb-3">
                                                <p className="text-2xl font-bold text-foreground tracking-tight">₹{budget.spent.toLocaleString()}</p>
                                                <p className="text-sm font-semibold text-gray-500">of ₹{budget.allocated.toLocaleString()}</p>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${budget.overBudget ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-primary'}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className={`text-sm font-semibold mt-4 ${budget.overBudget ? 'text-red-500' : 'text-gray-500'}`}>
                                                {budget.overBudget
                                                    ? `Exceeded by ₹${(budget.spent - budget.allocated).toLocaleString()}`
                                                    : `₹${(budget.allocated - budget.spent).toLocaleString()} left`}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Savings Goals dynamically mapped */}
                            {goals.map(goal => {
                                const percentage = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
                                const IconComp = getIconComponent(goal.icon_name);

                                let finalBg = goal.bg;
                                if (finalBg === 'bg-accent/10' || finalBg === 'bg-kol-blue') finalBg = 'bg-secondary/10';
                                else finalBg = 'bg-gray-50';

                                return (
                                    <div key={goal.id} className={`group ${finalBg} border border-gray-100 rounded-[32px] shadow-soft hover:-translate-y-1 hover:shadow-soft-lg transition-all p-8 flex flex-col h-full relative overflow-hidden`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                                            className="absolute -top-3 -right-3 bg-white text-red-500 p-2 border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-20 shadow-soft rounded-full"
                                            title="Delete Goal"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-4 mb-8 relative z-10">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-white text-secondary shadow-soft`}>
                                                <IconComp className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-xl text-foreground tracking-tight">{goal.name}</h3>
                                        </div>
                                        <div className="mt-auto relative z-10">
                                            <div className="flex justify-between items-end mb-3">
                                                <p className="text-2xl font-bold text-foreground tracking-tight">₹{goal.current_amount.toLocaleString()}</p>
                                                <p className="text-sm font-semibold text-gray-500">Goal: ₹{goal.target_amount.toLocaleString()}</p>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-soft-inner relative">
                                                <div className="h-full bg-secondary transition-all duration-1000 rounded-full" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-500 mt-4">{percentage.toFixed(0)}% Achieved</p>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </main>

                {/* Create Budget Modal */}
                <AnimatePresence>
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                                onClick={() => setIsAddModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-[32px] shadow-soft-lg w-full max-w-md overflow-hidden animation-scale-in z-10"
                            >
                                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">Create Budget</h2>
                                            <p className="text-sm text-gray-500">Set a new spending limit</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="text-gray-400 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddBudget} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 mb-2">Budget Name</label>
                                        <input
                                            type="text"
                                            value={budgetName}
                                            onChange={(e) => setBudgetName(e.target.value)}
                                            placeholder="e.g. Groceries"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 mb-2">Category</label>
                                        <select
                                            value={budgetCategory}
                                            onChange={(e) => setBudgetCategory(e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold cursor-pointer"
                                        >
                                            <option value="Housing">Housing & Utilities</option>
                                            <option value="Food">Food & Dining</option>
                                            <option value="Tech">Tech Subscriptions</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 mb-2">Allocated Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={budgetAllocated}
                                            onChange={(e) => setBudgetAllocated(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-all shadow-soft hover:shadow-soft-lg mt-4"
                                    >
                                        Create Budget
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Create Goal Modal */}
                <AnimatePresence>
                    {isAddGoalModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                                onClick={() => setIsAddGoalModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-[32px] shadow-soft-lg w-full max-w-md overflow-hidden z-10"
                            >
                                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">Create Goal</h2>
                                            <p className="text-sm text-gray-500">Set a new savings target</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddGoalModalOpen(false)}
                                        className="text-gray-400 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddGoal} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 mb-2">Goal Name</label>
                                        <input
                                            type="text"
                                            value={goalName}
                                            onChange={(e) => setGoalName(e.target.value)}
                                            placeholder="e.g. Vacation Fund"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-semibold"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-500 mb-2">Target Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={goalTargetAmount}
                                            onChange={(e) => setGoalTargetAmount(e.target.value)}
                                            placeholder="100000"
                                            className="w-full bg-gray-50 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-semibold"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-4 rounded-full transition-all shadow-soft hover:shadow-soft-lg mt-4"
                                    >
                                        Create Goal
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
