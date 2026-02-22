"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Search, Bell, Menu, LogOut, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/login/actions";

export function Header() {
    const headerRef = useRef<HTMLElement>(null);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

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

                <div className="flex items-center gap-3 bg-white shadow-soft rounded-full pl-3 pr-1 py-1 border border-gray-50">
                    <div className="text-right hidden sm:block px-2">
                        <p className="text-sm font-semibold text-black leading-tight max-w-[120px] truncate">
                            {user?.email?.split('@')[0] || "Guest"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            {user ? "Pro User" : "Visitor"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                            <span className="text-white text-xs font-bold font-kol">
                                {user?.email?.[0].toUpperCase() || "G"}
                            </span>
                        </div>

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

