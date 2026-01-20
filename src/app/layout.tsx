import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "ScriptGo | Professional Content Suite",
    description: "Create structured scripts and posts with speed and precision.",
    keywords: ["content writing", "YouTube scripts", "LinkedIn posts", "productivity"],
    openGraph: {
        title: "ScriptGo | Professional Content Suite",
        description: "Direct, high-performance content creation.",
        type: "website",
        locale: "en_US",
        url: "https://scriptgo.io",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="font-sans antialiased min-h-screen flex flex-col text-foreground selection:bg-primary/20">
                {children}
            </body>
        </html>
    );
}
