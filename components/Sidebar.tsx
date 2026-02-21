"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  Home,
  Settings,
  BarChart2,
  Wallet,
  ReceiptText,
  PieChart,
  User,
  Eye,
  CreditCard,
  Building2
} from "lucide-react";
import clsx from "clsx";

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/", badge: undefined },
    { icon: ReceiptText, label: "Transactions", href: "/ledger", badge: "2 New" },
    { icon: Wallet, label: "Accounts", href: "/accounts", badge: undefined },
    { icon: Building2, label: "Budgets", href: "/budgets" },
    { icon: BarChart2, label: "Analytics", href: "/analytics", badge: "NEW" },
    { icon: PieChart, label: "Reports", href: "#" },
    { icon: CreditCard, label: "Cards", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
    { icon: User, label: "Profile", href: "#" },
  ];

  useEffect(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="w-[280px] h-[calc(100vh-32px)] my-4 ml-4 bg-white rounded-[32px] shadow-soft border border-gray-100 flex flex-col pt-8 pb-6 overflow-y-auto hide-scrollbar shrink-0 z-50"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      <div className="px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <span className="text-black font-kol text-xl tracking-tighter">K</span>
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-lg tracking-tight leading-none">Kolpay</h2>
            <p className="text-gray-400 text-[10px] mt-1 font-medium uppercase tracking-widest">Finance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3 mt-2">Menu</h3>
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={i}
              href={item.href || "#"}
              className={clsx(
                "flex items-center justify-between px-4 py-3 rounded-full transition-all duration-200 text-sm font-medium w-full",
                isActive
                  ? "bg-black shadow-soft text-white"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className={clsx(
                  "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                  isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 px-6 flex flex-col gap-3">
        <button className="flex items-center justify-center gap-2 w-full bg-accent text-black font-semibold rounded-full py-3 hover:-translate-y-0.5 hover:shadow-soft transition-all text-sm">
          <Eye className="w-4 h-4" />
          Live Preview
        </button>
      </div>
    </aside>
  );
}
