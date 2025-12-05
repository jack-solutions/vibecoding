"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Users, Library, Clock, ThumbsUp, PlaySquare, History } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: Users, label: "Subscriptions", href: "/subscriptions" },
];

const libraryItems = [
    { icon: Library, label: "Library", href: "/library" },
    { icon: History, label: "History", href: "/history" },
    { icon: ThumbsUp, label: "Liked videos", href: "/liked" },
    { icon: Clock, label: "Watch later", href: "/watch-later" },
];

export default function YouTubeSidebar({ collapsed = false, mobile = false }: { collapsed?: boolean; mobile?: boolean }) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            mobile ? "w-full" : "yt-sidebar transition-all duration-200",
            !mobile && (collapsed ? "w-[72px]" : "w-60")
        )}>
            <div className="p-3">
                {/* Main navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "yt-sidebar-item",
                                    isActive && "yt-sidebar-item-active"
                                )}
                            >
                                <Icon className={cn("w-6 h-6 flex-shrink-0", collapsed && !mobile && "mx-auto")} />
                                {(!collapsed || mobile) && <span className="text-sm">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {(!collapsed || mobile) && (
                    <>
                        {/* Divider */}
                        <div className="my-3 border-t border-border" />

                        {/* Library items */}
                        <nav className="space-y-1">
                            {libraryItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "yt-sidebar-item",
                                            isActive && "yt-sidebar-item-active"
                                        )}
                                    >
                                        <Icon className="w-6 h-6 flex-shrink-0" />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </>
                )}
            </div>
        </aside>
    );
}
