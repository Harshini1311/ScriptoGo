"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Youtube, Linkedin, Calendar, MousePointer2, CheckCircle2, X, ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";

const FRAMEWORKS = [
    {
        id: "viral",
        label: "Viral Psychology",
        time: "4 min read",
        description: "Master the patterns that trigger social sharing and high engagement. This framework focuses on curiosity gaps and emotional resonance.",
        example: "The '3-Step Viral Loop': Connect a common frustration to an unexpected solution, then bridge to a direct takeaway.",
        useCase: "Best for top-of-funnel awareness and explosive growth."
    },
    {
        id: "hook",
        label: "Hook Engineering",
        time: "6 min read",
        description: "Your content lives or dies in the first 3 seconds. Learn to engineer hooks that stop the scroll using pattern interrupts.",
        example: "The Negative-Positive Pivot: 'I spent 100 hours doing X so you don't have to. Here are the 3 things that actually matter.'",
        useCase: "Essential for Shorts, Reels, and LinkedIn threads."
    },
    {
        id: "retention",
        label: "Retention Tactics",
        time: "3 min read",
        description: "Keep viewers watching until the very end. This framework uses 'open loops' and value layering to minimize drop-off.",
        example: "The 'Nested Loop': Mention a secret early on, explain the context, then reveal the secret only at the climax.",
        useCase: "Ideal for long-form educational or storytelling content."
    },
    {
        id: "aida",
        label: "Scripting Workflows",
        time: "5 min read",
        description: "A professional mapping of Attention, Interest, Desire, and Action. Use this to construct high-intent narratives that drive specific user outcomes.",
        example: "Hook: Stop guessing. Interest: This structure works. Desire: Save 2 hours daily. Action: Start today.",
        useCase: "Best for product launches and direct response authority."
    }
];

export default function Home() {
    const [selectedFramework, setSelectedFramework] = useState<typeof FRAMEWORKS[0] | null>(null);

    return (
        <main className="relative flex min-h-screen flex-col items-center text-foreground selection:bg-primary/20 overflow-x-hidden">
            {/* Structured Background (Handled via globals.css Grid) */}
            {/* Background unblocked to show global gradients */}

            {/* Sticky Nav */}
            <nav className="sticky top-0 z-[100] w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2 group cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold tracking-tight">ScriptGo</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                        <a href="#anatomy" className="text-muted-foreground hover:text-foreground transition-colors">Frameworks</a>
                        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative w-full max-w-7xl flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center lg:pt-32 lg:pb-40">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-8 animate-slide-up leading-[1.05] max-w-4xl">
                    Focus on telling.<br />
                    We handle the drafting.
                </h1>

                <p className="max-w-xl text-lg md:text-xl text-muted-foreground mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
                    A professional content workspace for creators. Draft high-performing YouTube scripts and LinkedIn posts with precision, not fluff.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <Link
                        href="/login"
                        className="px-6 py-3 rounded-md bg-primary text-white font-medium text-sm transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm"
                    >
                        Start drafting
                    </Link>
                    <a href="#anatomy" className="px-6 py-3 rounded-md border border-border bg-secondary font-medium text-sm hover:bg-card transition-all flex items-center gap-2 active:scale-[0.98]">
                        View frameworks
                    </a>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="w-full max-w-7xl py-24 px-6">
                <div className="mb-20 text-center space-y-3">
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Tools for intentional creators.</h2>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto">Focused workspaces designed to bridge the gap between idea and draft.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 glass-card">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <Youtube className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 tracking-tight">Structured Scripts</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Built-in frameworks for educational, storytelling, and viral video formats.</p>
                    </div>

                    <div className="p-8 glass-card">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <Linkedin className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 tracking-tight">Authority Posts</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Transform insights into professional threads that build domain authority.</p>
                    </div>

                    <div className="p-8 glass-card">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 tracking-tight">Batch Planning</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Generate 30 days of content strategy without the repetitive noise.</p>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="w-full border-y border-border py-32 px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row gap-20 items-center">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">Built for a <br />better workflow.</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">We focus on viral psychology and structure, so you can focus on your perspective.</p>

                            <div className="space-y-6 pt-4">
                                {[
                                    { title: "Plan", desc: "Select your platform and define your goals." },
                                    { title: "Generate", desc: "Our engine creates a structured draft based on your topic." },
                                    { title: "Refine", desc: "Use direct actions to edit and save your final results." }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="h-10 w-10 min-w-[40px] rounded-md bg-secondary flex items-center justify-center text-primary text-xs font-bold border border-border group-hover:bg-card transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold">{step.title}</h4>
                                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center relative">
                            <div className="glass-card relative p-3 border-border">
                                <div className="h-[400px] w-full max-w-[500px] rounded-md bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground text-sm flex-col gap-4">
                                    <MousePointer2 className="h-6 w-6 text-primary/40" />
                                    <span className="opacity-30 tracking-tight">Workspace Preview</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Framework Anatomy Section */}
            <section id="anatomy" className="w-full max-w-7xl py-24 px-6 border-t border-border">
                <div className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="flex-1 space-y-6 md:sticky md:top-32">
                        <h2 className="text-4xl font-semibold tracking-tight">The anatomy of impact.</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">Most content fails because it lacks structure. Our engine builds scripts using proven attention-retention frameworks.</p>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            {[
                                { title: "The Hook", desc: "Interrupt the scroll with a curiosity gap." },
                                { title: "Retention Bridge", desc: "Connect the promise to the context." },
                                { title: "Value Layer", desc: "Deliver the core information directly." },
                                { title: "The Loop", desc: "Seed the next interaction instantly." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-md border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <div>
                                        <div className="text-sm font-semibold tracking-tight">{item.title}</div>
                                        <div className="text-[11px] text-muted-foreground/80">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="rounded-md border border-border bg-card overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-white/10" />
                                    <div className="h-2 w-2 rounded-full bg-white/10" />
                                    <div className="h-2 w-2 rounded-full bg-white/10" />
                                </div>
                                <div className="text-[10px] uppercase tracking-widest font-bold opacity-30">Framework: Educational-Viral</div>
                            </div>
                            <div className="p-8 space-y-6 font-mono text-sm leading-relaxed">
                                <div className="space-y-3">
                                    <div className="text-primary font-bold text-[10px] uppercase tracking-wider opacity-60">01 // THE HOOK</div>
                                    <div className="p-5 rounded-md border border-primary/20 bg-primary/5 italic text-foreground/90">&quot;Most creators are missing 80% of their potential reach. Here is why.&quot;</div>
                                </div>
                                <div className="space-y-3 opacity-40">
                                    <div className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">02 // THE BRIDGE</div>
                                    <div className="p-5 rounded-md border border-border bg-secondary/50">It is not the algorithm. It is how you structure the first 15 seconds.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Knowledge Base Section (Replacing Redundant CTA) */}
            <section className="w-full max-w-7xl py-32 px-6 border-t border-white/5 mx-auto">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-3xl font-semibold tracking-tight">Master the craft.</h2>
                        <p className="text-base text-muted-foreground max-w-md">Content is a game of logic, not luck. Access our library of frameworks designed for conversion.</p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {FRAMEWORKS.map((fw) => (
                            <div
                                key={fw.id}
                                onClick={() => setSelectedFramework(fw)}
                                className="p-6 rounded-md border border-border bg-secondary/40 hover:bg-secondary/80 transition-all cursor-pointer group hover:border-primary/30"
                            >
                                <div className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest opacity-80 group-hover:opacity-100">{fw.time}</div>
                                <div className="text-base font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                                    {fw.label}
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Framework Side Panel */}
            <div
                className={`fixed inset-0 z-[200] flex justify-end transition-opacity duration-300 ${selectedFramework ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                    onClick={() => setSelectedFramework(null)}
                />

                {/* Panel Content */}
                <div
                    className={`relative h-full w-full max-w-md bg-card border-l border-border shadow-2xl transition-transform duration-500 ease-out transform ${selectedFramework ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/50">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Framework Details</span>
                            </div>
                            <button
                                onClick={() => setSelectedFramework(null)}
                                className="p-2 rounded-md hover:bg-secondary transition-colors"
                                title="Close Panel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold tracking-tight">{selectedFramework?.label}</h3>
                                <p className="text-base text-muted-foreground/90 leading-relaxed font-medium">{selectedFramework?.description}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Context / Use Case</h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">{selectedFramework?.useCase}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Execution Example</h4>
                                <div className="p-6 rounded-md border border-border bg-secondary/30 font-mono text-sm leading-relaxed italic text-muted-foreground/90 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                                    &quot;{selectedFramework?.example}&quot;
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-border bg-secondary/30">
                            <Link
                                href={`/editor?framework=${selectedFramework?.id}`}
                                className="flex w-full items-center justify-center gap-3 rounded-md bg-primary py-4 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-[0.98] shadow-glow-sm"
                            >
                                <span>Use this framework</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
