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
            className="h-20 w-full flex items-center justify-between px-8 bg-white/50 backdrop-blur-xl border-b border-border z-10 sticky top-0"
        >
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-500 hover:text-foreground">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for metrics or settings..."
                        className="w-full pl-11 pr-4 py-2 bg-gray-50/50 border border-border rounded-lg text-sm text-foreground outline-none focus:bg-white focus:border-accent/40 focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-foreground transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-6 w-px bg-border"></div>

                <div className="flex items-center gap-3 cursor-pointer group rounded-xl p-1 hover:bg-gray-50 transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground leading-tight">Admin</p>
                        <p className="text-[11px] font-medium text-gray-500">Free Tier</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-purple-400 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white border border-white flex items-center justify-center">
                            <span className="text-accent text-xs font-bold">OS</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
