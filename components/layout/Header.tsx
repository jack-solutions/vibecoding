"use client";

import Link from "next/link";
import { Search, Mic, Upload, Bell, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useCurrentUser, useLogout } from "@/lib/auth/hooks";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import YouTubeSidebar from "./Sidebar";

export default function YouTubeHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useCurrentUser();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="yt-header">
            <div className="flex items-center justify-between h-full px-4">
                {/* Left: Menu + Logo */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="yt-icon-button lg:hidden">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0 bg-background border-border">
                            <div className="pt-4">
                                <YouTubeSidebar mobile />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Menu */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="yt-icon-button hidden lg:flex"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-6 h-6" />
                    </Button>

                    <Link href="/home" className="flex items-center gap-1">
                        <svg className="w-7 h-7" viewBox="0 0 28 20" fill="none">
                            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000" />
                            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white" />
                        </svg>
                        <span className="text-xl font-medium">YouTube</span>
                    </Link>
                </div>

                {/* Center: Search */}
                <div className="yt-search-container hidden md:flex">
                    <div className="flex items-center flex-1">
                        <input
                            type="text"
                            placeholder="Search"
                            className="yt-search-input"
                        />
                        <button className="yt-search-button">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    <Button variant="ghost" size="icon" className="yt-icon-button ml-2">
                        <Mic className="w-5 h-5" />
                    </Button>
                </div>

                {/* Right: Icons + Profile */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="yt-icon-button"
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>

                    {user?.isAuthenticated ? (
                        <>
                            {user.role === "creator" && (
                                <Link href="/upload">
                                    <Button variant="ghost" size="icon" className="yt-icon-button">
                                        <Upload className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )}

                            <Button variant="ghost" size="icon" className="yt-icon-button">
                                <Bell className="w-5 h-5" />
                            </Button>

                            <div className="yt-avatar w-8 h-8 cursor-pointer">
                                <span className="text-sm font-medium">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline" className="rounded-full border-blue-500 text-blue-500 px-4">
                                Sign in
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
