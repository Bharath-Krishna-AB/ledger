"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Building2, Landmark, CreditCard, Wallet, HomeIcon, Coffee, MonitorSmartphone, Plane, ShoppingBag, Target, Activity } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// --- Types ---

export type TransactionType = "Income" | "Expense";

export interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    type: TransactionType;
    amount: number;
    status: "Completed" | "Pending";
    category_prices?: Record<string, number>;
    invoice_ref?: string;
    source?: 'manual' | 'scan' | 'voice';
}

export interface Account {
    id: string;
    name: string;
    type: "Checking" | "Savings" | "Credit Card" | "Digital Asset";
    balance: number;
    limit?: number;
    currency: string;
    iconName: string;
    color: string;
    bg: string;
}

export interface Budget {
    id: string;
    name: string;
    allocated: number;
    spent: number;
    iconName: string;
    color: string;
    bg: string;
    bar: string;
    overBudget?: boolean;
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    status: string;
    usage: string;
    category: string;
    warning?: string;
}

export interface Goal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    icon_name: string;
    color: string;
    bg: string;
}

// --- Context Definition ---

interface FinanceContextType {
    transactions: Transaction[];
    accounts: Account[];
    budgets: Budget[];
    subscriptions: Subscription[];
    goals: Goal[];

    addTransaction: (txn: Omit<Transaction, "id" | "status">) => void;
    addAccount: (acc: Omit<Account, "id">) => void;
    addBudget: (bgt: Omit<Budget, "id" | "spent" | "overBudget">) => void;
    addSubscription: (sub: Omit<Subscription, "id">) => void;
    addGoal: (goal: Omit<Goal, "id" | "current_amount">) => void;

    deleteTransaction: (id: string) => void;
    deleteAccount: (id: string) => void;
    deleteBudget: (id: string) => void;
    deleteSubscription: (id: string) => void;
    deleteGoal: (id: string) => void;

    getIconComponent: (iconName: string) => React.ElementType;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
    const supabase = createClient();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    // Initial Load from Supabase
    useEffect(() => {
        const loadData = async () => {
            const [txnRes, accRes, bgtRes, subRes, goalsRes] = await Promise.all([
                supabase.from('transactions').select('*').order('created_at', { ascending: false }),
                supabase.from('accounts').select('*').order('created_at', { ascending: true }),
                supabase.from('budgets').select('*').order('created_at', { ascending: true }),
                supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
                supabase.from('goals').select('*').order('created_at', { ascending: true })
            ]);

            const possibleErrors = [txnRes.error, accRes.error, bgtRes.error, subRes.error, goalsRes.error].filter(Boolean);
            if (possibleErrors.length > 0) {
                const errorMessage = possibleErrors.map(e => e?.message).join(" | ");
                console.error("Database Error:", errorMessage);
                setDbError(errorMessage);
                return;
            }

            // Map NUMERIC string responses to numbers safely
            if (txnRes.data) {
                setTransactions(txnRes.data.map(t => ({ ...t, amount: Number(t.amount) })));
            }
            if (accRes.data) {
                setAccounts(accRes.data.map(a => ({ ...a, balance: Number(a.balance), limit: a.limit ? Number(a.limit) : undefined })));
            }
            if (bgtRes.data) {
                setBudgets(bgtRes.data.map(b => ({ ...b, allocated: Number(b.allocated), spent: Number(b.spent) })));
            }
            if (subRes.data) {
                setSubscriptions(subRes.data.map(s => ({ ...s, amount: Number(s.amount) })));
            }
            if (goalsRes.data) {
                setGoals(goalsRes.data.map(g => ({ ...g, target_amount: Number(g.target_amount), current_amount: Number(g.current_amount) })));
            }

            setIsLoaded(true);
        };
        loadData();
    }, [supabase]);

    // Actions
    const addTransaction = async (txnData: Omit<Transaction, "id" | "status">) => {
        const { data, error } = await supabase.from('transactions').insert([{
            date: txnData.date,
            description: txnData.description,
            category: txnData.category,
            type: txnData.type,
            amount: txnData.amount,
            status: 'Completed'
        }]).select().single();

        if (data) {
            const newTxn = { ...data, amount: Number(data.amount) };
            setTransactions(prev => [newTxn, ...prev]);

            // Smart Budget integration: Update spent amounts
            const matchedBudget = budgets.find(b =>
                txnData.category === b.name ||
                (txnData.category === "Software" && b.name === "Tech Subscriptions") ||
                (txnData.category === "Services" && b.name === "Housing & Utilities")
            );

            if (matchedBudget) {
                const newSpent = matchedBudget.spent + txnData.amount;
                const overBudget = newSpent > matchedBudget.allocated;
                const { data: bgtData } = await supabase.from('budgets')
                    .update({ spent: newSpent, overBudget })
                    .eq('id', matchedBudget.id)
                    .select().single();

                if (bgtData) {
                    const updatedBgt = { ...bgtData, allocated: Number(bgtData.allocated), spent: Number(bgtData.spent) };
                    setBudgets(prev => prev.map(b => b.id === updatedBgt.id ? updatedBgt : b));
                }
            }

            // Adjust primary account balance
            const primaryAcc = accounts.find(a => a.type === 'Checking');
            if (primaryAcc) {
                const newBalance = primaryAcc.balance + (txnData.type === 'Income' ? txnData.amount : -txnData.amount);
                const { data: accData } = await supabase.from('accounts')
                    .update({ balance: newBalance })
                    .eq('id', primaryAcc.id)
                    .select().single();

                if (accData) {
                    const updatedAcc = { ...accData, balance: Number(accData.balance), limit: accData.limit ? Number(accData.limit) : undefined };
                    setAccounts(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a));
                }
            }
        } else if (error) {
            console.error("Failed to insert transaction:", error);
        }
    };

    const addAccount = async (accData: Omit<Account, "id">) => {
        const { data } = await supabase.from('accounts').insert([accData]).select().single();
        if (data) {
            setAccounts(prev => [...prev, { ...data, balance: Number(data.balance), limit: data.limit ? Number(data.limit) : undefined }]);
        }
    };

    const addBudget = async (bgtData: Omit<Budget, "id" | "spent" | "overBudget">) => {
        const { data } = await supabase.from('budgets').insert([{
            ...bgtData,
            spent: 0,
            overBudget: false
        }]).select().single();

        if (data) {
            setBudgets(prev => [...prev, { ...data, allocated: Number(data.allocated), spent: Number(data.spent) }]);
        }
    };

    const addSubscription = async (subData: Omit<Subscription, "id">) => {
        const { data } = await supabase.from('subscriptions').insert([subData]).select().single();
        if (data) {
            setSubscriptions(prev => [{ ...data, amount: Number(data.amount) }, ...prev]);
        }
    };

    const addGoal = async (goalData: Omit<Goal, "id" | "current_amount">) => {
        const { data } = await supabase.from('goals').insert([{ ...goalData, current_amount: 0 }]).select().single();
        if (data) {
            setGoals(prev => [...prev, { ...data, target_amount: Number(data.target_amount), current_amount: Number(data.current_amount) }]);
        }
    };

    const deleteTransaction = async (id: string) => {
        await supabase.from('transactions').delete().eq('id', id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const deleteAccount = async (id: string) => {
        await supabase.from('accounts').delete().eq('id', id);
        setAccounts(prev => prev.filter(a => a.id !== id));
    };

    const deleteBudget = async (id: string) => {
        await supabase.from('budgets').delete().eq('id', id);
        setBudgets(prev => prev.filter(b => b.id !== id));
    };

    const deleteSubscription = async (id: string) => {
        await supabase.from('subscriptions').delete().eq('id', id);
        setSubscriptions(prev => prev.filter(s => s.id !== id));
    };

    const deleteGoal = async (id: string) => {
        await supabase.from('goals').delete().eq('id', id);
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const getIconComponent = (iconName: string): React.ElementType => {
        const iconMap: Record<string, React.ElementType> = {
            "Building2": Building2,
            "Landmark": Landmark,
            "CreditCard": CreditCard,
            "Wallet": Wallet,
            "HomeIcon": HomeIcon,
            "Coffee": Coffee,
            "MonitorSmartphone": MonitorSmartphone,
            "Plane": Plane,
            "ShoppingBag": ShoppingBag,
            "Target": Target,
            "Activity": Activity
        };
        return iconMap[iconName] || Wallet;
    };

    if (dbError) {
        return (
            <div className="fixed inset-0 z-50 bg-red-950 flex flex-col items-center justify-center p-20 text-center">
                <h1 className="text-red-500 text-6xl font-black mb-4">CRITICAL DATABASE ERROR</h1>
                <p className="text-red-300 text-2xl font-mono">{dbError}</p>
            </div>
        );
    }

    if (!isLoaded) return null;

    console.log("FinanceContext loaded data:", { transactions, accounts, budgets, subscriptions, goals });

    return (
        <FinanceContext.Provider value={{
            transactions,
            accounts,
            budgets,
            subscriptions,
            goals,
            addTransaction,
            addAccount,
            addBudget,
            addSubscription,
            addGoal,
            deleteTransaction,
            deleteAccount,
            deleteBudget,
            deleteSubscription,
            deleteGoal,
            getIconComponent
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error("useFinance must be used within a FinanceProvider");
    }
    return context;
};
