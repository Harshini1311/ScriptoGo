"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

export default function OnboardingTip() {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hasSeenTip = localStorage.getItem("hasSeenScopeLineTip");
        if (!hasSeenTip) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("hasSeenScopeLineTip", "true");
    };

    if (!mounted || !isVisible) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm mx-4">
            <div className="relative p-6 rounded-md border border-primary/20 bg-card shadow-2xl overflow-hidden transition-all duration-500 ease-out translate-y-0 opacity-100">
                {/* Accent Glow */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />

                <div className="flex gap-4 relative">
                    <div className="flex-shrink-0">
                        <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary">Pro Tip</h4>
                            <button
                                onClick={handleDismiss}
                                className="text-muted-foreground/40 hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground/90 font-medium italic">
                            "ScriptGo is a focused workspace that replaces scattered notes, spreadsheets, and multiple apps for planning, scripting, and publishing creator content."
                        </p>

                        <button
                            onClick={handleDismiss}
                            className="text-[10px] uppercase font-bold tracking-widest text-primary hover:underline"
                        >
                            Got it, thanks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
