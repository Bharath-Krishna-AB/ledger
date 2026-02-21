"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  Home,
  Settings,
  BarChart2,
  Box,
  ShoppingBag,
  MessageSquare,
  Instagram,
  User,
  Eye,
  ListPlus,
  Wallet
} from "lucide-react";
import clsx from "clsx";

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Overview", href: "/", badge: undefined },
    { icon: ListPlus, label: "Store setup", href: "#", badge: "Complete" },
    { icon: Wallet, label: "Ledger", href: "/ledger", badge: undefined },
    { icon: Box, label: "Products", href: "#" },
    { icon: ShoppingBag, label: "Orders", href: "#" },
    { icon: MessageSquare, label: "Messages", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: BarChart2, label: "Analytics", href: "#" },
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
      className="w-[280px] h-screen bg-white border-r border-border flex flex-col pt-8 pb-6 overflow-y-auto hide-scrollbar shrink-0"
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-800 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg tracking-tighter">K</span>
          </div>
          <div>
            <h2 className="text-foreground font-bold text-xl tracking-tight leading-none">Kolpay</h2>
            <p className="text-gray-400 text-xs mt-1">Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-2 mt-4">Menu</h3>
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={i}
              href={item.href || "#"}
              className={clsx(
                "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium w-full relative overflow-hidden group",
                isActive
                  ? "text-accent bg-accent/5"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-md"></div>
              )}
              <div className="flex items-center gap-3">
                <item.icon className={clsx("w-4 h-4", isActive ? "text-accent" : "text-gray-400 group-hover:text-foreground")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-green-100/50 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-green-200/50">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 px-6 flex flex-col gap-3">
        <button className="flex items-center justify-center gap-2 w-full bg-white border border-border text-foreground font-semibold py-2.5 rounded-xl hover:border-accent hover:text-accent transition-all shadow-sm text-sm">
          <Eye className="w-4 h-4" />
          Live Preview
        </button>
      </div>
    </aside>
  );
}
