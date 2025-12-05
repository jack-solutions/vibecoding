"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    useEffect(() => {
        // Set dark mode as default
        document.documentElement.classList.add("dark");
    }, []);

    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}
