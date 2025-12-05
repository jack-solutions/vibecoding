import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
    title: "YouTube Clone",
    description: "A YouTube-style video platform built with Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
