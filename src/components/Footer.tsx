"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-secondary/30 py-20 px-6 mt-auto">
            <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 opacity-60">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold tracking-tight">ScriptGo</span>
                    </div>
                    <p className="text-xs leading-relaxed max-w-xs text-muted-foreground/60">
                        A focused workspace that replaces scattered notes, spreadsheets, and multiple apps for planning, scripting, and publishing creator content.
                    </p>
                </div>
                <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest mb-4">Product</h5>
                    <ul className="space-y-2 text-xs">
                        <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                        <li><Link href="/editor" className="hover:text-primary transition-colors">Editor</Link></li>
                        <li><Link href="/calendar" className="hover:text-primary transition-colors">Calendar</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest mb-4">Company</h5>
                    <ul className="space-y-2 text-xs">
                        <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest mb-4">Legal</h5>
                    <ul className="space-y-2 text-xs">
                        <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div className="mx-auto max-w-7xl flex pt-10 border-t border-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40 items-center justify-between">
                <div>© 2026 ScriptGo. Focus on creation.</div>
            </div>
        </footer>
    );
}
