"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Search, Bell, Menu } from "lucide-react";

export function Header() {
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        gsap.fromTo(
            headerRef.current,
            { y: -10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
    }, []);

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
                <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-soft hover:shadow-soft-lg text-gray-500 hover:text-black transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-3 cursor-pointer group bg-white shadow-soft rounded-full pl-3 pr-1 py-1 hover:shadow-soft-lg transition-all border border-gray-50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-black leading-tight">Admin</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Free Tier</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-black text-xs font-bold font-kol">OS</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
