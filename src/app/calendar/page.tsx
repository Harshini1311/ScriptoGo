"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CalendarView from "../../components/Calendar/CalendarView";
import { ArrowLeft, Loader2, Sparkles, LayoutGrid, Calendar as CalendarIcon, Copy, Save } from "lucide-react";
import { useToast } from "@/components/Toast";
import Footer from "@/components/Footer";

export default function CalendarPage() {
    const supabase = createClient();
    const { showToast, ToastComponent } = useToast();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [scripts, setScripts] = useState<any[]>([]);
    const [selectedScript, setSelectedScript] = useState<any>(null);
    const [days, setDays] = useState(7);
    const [config, setConfig] = useState({
        platform: "linkedin",
        topic: "",
        tone: "professional",
        language: "english",
        framework: "",
        audience: "",
    });

    const fetchCalendarScripts = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("scripts")
            .select("*")
            .eq("is_calendar_entry", true)
            .order("scheduled_date", { ascending: true });

        if (!error && data) {
            setScripts(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchCalendarScripts();
    }, [fetchCalendarScripts]);

    const handleBatchGenerate = async () => {
        if (!config.topic) return;
        setGenerating(true);
        try {
            const response = await fetch("/api/generate-batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...config, days }),
            });
            const data = await response.json();

            if (data.scripts) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Save generated batch to Supabase
                const scriptsToInsert = data.scripts.map((s: any) => ({
                    ...s,
                    user_id: user.id,
                    platform: config.platform,
                    tone: config.tone,
                    language: config.language,
                    framework: config.framework,
                    audience: config.audience,
                    is_calendar_entry: true,
                }));

                const { error } = await supabase.from("scripts").insert(scriptsToInsert);
                if (!error) {
                    showToast(`Generated ${days}-day plan successfully!`, "success");
                    fetchCalendarScripts();
                } else {
                    showToast("Failed to save calendar plan", "error");
                }
            }
        } catch (error) {
            showToast("Generation failed", "error");
            console.error("Batch generation failed", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        showToast("Copied to clipboard!", "success");
    };

    return (
        <div className="flex min-h-screen flex-col text-foreground animate-fade-in">
            {ToastComponent}
            <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <div className="h-4 w-[1px] bg-border" />
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    >
                        <option value={7}>7 Days Plan</option>
                        <option value={30}>30 Days Plan</option>
                    </select>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="mx-auto max-w-7xl space-y-8 animate-slide-up">
                    {/* Generation Section */}
                    <div className="rounded-md border border-border bg-secondary p-8 animate-slide-up relative overflow-hidden group">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-6 gap-6 items-end">
                            <div className="lg:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-muted-foreground/80 ml-1">Main Theme / Topic</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AI Marketing, Coding Tips..."
                                    className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus-glow transition-all"
                                    value={config.topic}
                                    onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                />
                            </div>
                            <div className="lg:col-span-1 space-y-2">
                                <label className="text-sm font-bold text-muted-foreground/80 ml-1">Platform</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus-glow transition-all cursor-pointer"
                                    value={config.platform}
                                    onChange={(e) => setConfig({ ...config, platform: e.target.value })}
                                >
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>
                            <div className="lg:col-span-1 space-y-2">
                                <label className="text-sm font-bold text-muted-foreground/80 ml-1">Audience</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CEOs, Students"
                                    className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus-glow transition-all"
                                    value={config.audience}
                                    onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                                />
                            </div>
                            <div className="lg:col-span-1 space-y-2">
                                <label className="text-sm font-bold text-muted-foreground/80 ml-1">Language</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-4 py-3 outline-none focus-glow transition-all cursor-pointer"
                                    value={config.language}
                                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                                >
                                    <option value="english">English</option>
                                    <option value="tamil">Tamil</option>
                                    <option value="hindi">Hindi</option>
                                    <option value="spanish">Spanish</option>
                                </select>
                            </div>
                            <button
                                onClick={handleBatchGenerate}
                                disabled={generating || !config.topic}
                                className="flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm disabled:opacity-50"
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-white" />}
                                <span>{generating ? "Generating..." : "Generate plan"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4 text-primary" />
                                Scheduled Posts
                            </h2>
                            {scripts.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Showing {scripts.length} planned entries
                                </p>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                            </div>
                        ) : scripts.length > 0 ? (
                            <CalendarView
                                days={days}
                                scripts={scripts}
                                onSelectDay={(script: any) => setSelectedScript(script)}
                            />
                        ) : (
                            <div className="flex h-80 flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/20 text-center p-8">
                                <div className="h-14 w-14 rounded-md bg-secondary flex items-center justify-center mb-4 border border-border/50">
                                    <CalendarIcon className="h-6 w-6 text-primary/40" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Your Calendar is Empty</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Set a goal above and generate a content strategy to see your schedule come alive.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Script Detail Modal/Sidebar Overlay */}
            {selectedScript && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="w-full max-w-2xl rounded-md border border-border bg-card shadow-2xl overflow-hidden animate-slide-up">
                        <div className="border-b border-border p-6 flex items-center justify-between bg-primary/5">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-primary/60">Selected Content</span>
                                <h2 className="text-xl font-bold line-clamp-1">{selectedScript.topic}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedScript(null)}
                                className="rounded-md h-8 w-8 flex items-center justify-center hover:bg-background/50 transition-colors"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-muted-foreground">Generated Strategy</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopy(selectedScript.content)}
                                            className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                                            title="Copy Content"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="rounded-md border border-border bg-background p-6 max-h-[400px] overflow-y-auto leading-relaxed whitespace-pre-wrap text-sm text-foreground/80">
                                    {selectedScript.content}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 text-primary border border-primary/10">
                                        <LayoutGrid className="h-3 w-3" />
                                        {selectedScript.platform}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/5 text-secondary border border-secondary/10">
                                        <CalendarIcon className="h-3 w-3" />
                                        {selectedScript.scheduled_date
                                            ? new Date(selectedScript.scheduled_date).toLocaleDateString()
                                            : "No date set"}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedScript(null)}
                                    className="rounded-md bg-secondary border border-border px-6 py-2 text-sm font-medium hover:bg-card transition-all active:scale-[0.98]"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
