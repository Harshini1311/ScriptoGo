"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Save, Copy, Zap, Youtube, Linkedin } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function EditScriptPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const supabase = createClient();
    const { showToast, ToastComponent } = useToast();
    const [loading, setLoading] = useState(false);

    const [fetching, setFetching] = useState(true);
    const [generatedContent, setGeneratedContent] = useState("");
    const [displayedContent, setDisplayedContent] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [config, setConfig] = useState({
        platform: "youtube",
        topic: "",
        tone: "professional",
        language: "english",
        framework: "",
        audience: "",
        duration: "standard",
    });

    const ensureString = (content: any): string => {
        if (!content) return "";
        if (typeof content === 'string') return content;
        if (typeof content === 'object') {
            return Object.entries(content)
                .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
                .join("\n\n");
        }
        return String(content);
    };

    // Typewriter Effect
    useEffect(() => {
        if (generatedContent && isTyping) {
            let i = 0;
            setDisplayedContent("");
            const interval = setInterval(() => {
                setDisplayedContent(generatedContent.slice(0, i));
                i += 5;
                if (i > generatedContent.length) {
                    setDisplayedContent(generatedContent);
                    setIsTyping(false);
                    clearInterval(interval);
                }
            }, 10);
            return () => clearInterval(interval);
        } else if (!isTyping) {
            setDisplayedContent(generatedContent);
        }
    }, [generatedContent, isTyping]);

    useEffect(() => {
        const fetchScript = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push("/login");

            const { data, error } = await supabase
                .from("scripts")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error || !data) {
                console.error("Error fetching script:", error);
                router.push("/dashboard");
                return;
            }

            setConfig({
                platform: data.platform,
                topic: data.topic,
                tone: data.tone || "professional",
                language: data.language || "english",
                framework: data.framework || "",
                audience: data.audience || "",
                duration: data.duration || "standard",
            });
            setGeneratedContent(ensureString(data.content));
            setFetching(false);
        };

        fetchScript();
    }, [params.id, router, supabase]);

    const handleGenerate = async () => {
        if (!config.topic) return;
        setLoading(true);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            const data = await response.json();
            if (data.content) {
                setGeneratedContent(ensureString(data.content));
                setIsTyping(true);
            }
        } catch (error: any) {
            console.error("Failed to generate content", error);
            showToast(error.message || "Failed to generate content", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!generatedContent || !config.topic) return;

        const allUpdate = {
            platform: config.platform,
            topic: config.topic,
            tone: config.tone,
            language: config.language,
            audience: config.audience,
            duration: config.duration,
            content: generatedContent,
            updated_at: new Date().toISOString(),
        };

        // Try 1: Update everything
        let { error } = await supabase
            .from("scripts")
            .update(allUpdate)
            .eq("id", params.id);

        // Titan-Failsafe: If any column/schema error occurs, strip everything but absolute core
        if (error && (
            error.message.toLowerCase().includes("column") ||
            error.message.toLowerCase().includes("schema cache") ||
            error.code === "PGRST204"
        )) {
            console.warn("Schema drift detected. Retrying with core update only...");
            const coreUpdate = {
                topic: config.topic,
                content: generatedContent,
                updated_at: new Date().toISOString()
            };

            const { error: retryError } = await supabase
                .from("scripts")
                .update(coreUpdate)
                .eq("id", params.id);

            if (!retryError) {
                showToast("Updated! (Sync lag detected, metadata skipped)", "success");
                setTimeout(() => router.push("/dashboard"), 1500);
                return;
            }
            error = retryError;
        }

        if (!error) {
            showToast("Script updated successfully!", "success");
            setTimeout(() => router.push("/dashboard"), 1500);
        } else {
            console.error("Critical Update Failure. Falling back to LocalStorage:", error);

            // INDESTRUCTIBLE FALLBACK
            try {
                const backups = JSON.parse(localStorage.getItem("scriptgo_backups") || "[]");
                backups.push({ ...allUpdate, id: params.id, local_id: `local_${Date.now()}` });
                localStorage.setItem("scriptgo_backups", JSON.stringify(backups));

                showToast("Updated in Browser (Database sync issue)! Recover it on the dashboard.", "success");
                setTimeout(() => router.push("/dashboard"), 2000);
            } catch (lsError) {
                showToast("Database and Browser storage failed. Please copy your script manually.", "error");
            }
        }
    };

    const copyToClipboard = () => {
        const textToCopy = ensureString(generatedContent);
        navigator.clipboard.writeText(textToCopy);
        showToast("Copied to clipboard!", "success");
    };

    const handleQuickAction = async (action: string) => {
        if (!generatedContent) return;
        setLoading(true);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...config,
                    topic: `Original script: ${generatedContent}\n\nREFINEMENT TASK: ${action}`,
                }),
            });
            const data = await response.json();
            if (data.content) {
                setGeneratedContent(ensureString(data.content));
                setIsTyping(true);
                showToast(`Action applied: ${action}`, "success");
            }
        } catch (error: any) {
            showToast(error.message || "Action failed", "error");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex h-screen items-center justify-center text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col text-foreground animate-fade-in">
            {ToastComponent}
            <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <h1 className="text-lg font-semibold tracking-tight">Script studio</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleUpdate}
                        disabled={!generatedContent}
                        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        <Save className="h-4 w-4" />
                        <span>Update script</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                {/* Left Control Panel */}
                <aside className="w-1/3 min-w-[320px] max-w-md border-r border-border bg-secondary p-6 overflow-y-auto animate-slide-up">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-muted-foreground/80">Platform</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfig({ ...config, platform: "youtube" })}
                                    className={`flex items-center gap-2 justify-center rounded-md border p-4 text-sm font-bold transition-all premium-hover ${config.platform === "youtube"
                                        ? "border-primary bg-primary/10 text-primary shadow-glow-sm"
                                        : "border-border bg-background hover:bg-secondary"
                                        }`}
                                >
                                    <Youtube className="h-4 w-4" />
                                    YouTube
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, platform: "linkedin" })}
                                    className={`flex items-center gap-2 justify-center rounded-md border p-4 text-sm font-bold transition-all premium-hover ${config.platform === "linkedin"
                                        ? "border-blue-500 bg-blue-500/10 text-blue-500"
                                        : "border-border bg-background hover:bg-secondary"
                                        }`}
                                >
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground/80">Topic</label>
                            <textarea
                                value={config.topic}
                                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                placeholder="What should this script be about?"
                                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus-glow min-h-[120px] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground/80">Tone</label>
                                <select
                                    value={config.tone}
                                    onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus-glow transition-all"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="funny">Funny</option>
                                    <option value="inspirational">Inspirational</option>
                                    <option value="controversial">Controversial</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground/80">Language</label>
                                <select
                                    value={config.language}
                                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus-glow transition-all"
                                >
                                    <option value="english">English</option>
                                    <option value="tamil">Tamil</option>
                                    <option value="hindi">Hindi</option>
                                    <option value="telugu">Telugu</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground/80">Marketing Framework</label>
                            <select
                                value={config.framework}
                                onChange={(e) => setConfig({ ...config, framework: e.target.value })}
                                className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus-glow transition-all"
                            >
                                <option value="">None (Natural Flow)</option>
                                <option value="aida">AIDA (Attention, Interest, Desire, Action)</option>
                                <option value="pas">PAS (Problem, Agitation, Solution)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground/80">Target Audience (Optional)</label>
                            <input
                                type="text"
                                value={config.audience}
                                onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                                placeholder="Who is this for? (e.g., Techies, Moms)"
                                className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus-glow transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground/80">Target Length</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "short", label: "Short", desc: "1-3 min" },
                                    { id: "standard", label: "Std", desc: "5-8 min" },
                                    { id: "long", label: "Long", desc: "10+ min" }
                                ].map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setConfig({ ...config, duration: d.id })}
                                        className={`flex flex-col items-center justify-center rounded-md border py-2 px-1 transition-all ${config.duration === d.id
                                            ? "border-primary bg-primary/10 text-primary shadow-glow-sm"
                                            : "border-border bg-background hover:bg-secondary"
                                            }`}
                                    >
                                        <span className="text-xs font-bold">{d.label}</span>
                                        <span className="text-[10px] opacity-60 font-medium">{d.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !config.topic}
                            className="w-full flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 fill-white" />
                                    <span>Regenerate script</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Right Preview Pane */}
                <section className="flex-1 p-8 overflow-y-auto">
                    <div className="mx-auto max-w-3xl">
                        {loading ? (
                            <div className="space-y-4 pt-20 text-center animate-pulse">
                                <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                <p className="text-xl font-medium text-muted-foreground">Updating your script...</p>
                            </div>
                        ) : generatedContent ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Active Session</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuickAction("make shorter")}
                                            className="px-3 py-1.5 rounded-md bg-background border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all premium-hover shadow-sm"
                                        >
                                            Shorten
                                        </button>
                                        <button
                                            onClick={() => handleQuickAction("make more casual")}
                                            className="px-3 py-1.5 rounded-md bg-background border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all premium-hover shadow-sm"
                                        >
                                            Casual
                                        </button>
                                        <button
                                            onClick={() => handleQuickAction("regenerate hook")}
                                            className="px-3 py-1.5 rounded-md bg-background border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all premium-hover shadow-sm"
                                        >
                                            New Hook
                                        </button>
                                    </div>
                                </div>

                                <div className="glass-card p-8 min-h-[500px] border-white/5 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 rounded-md bg-background border border-border hover:bg-secondary text-foreground transition-all shadow-sm"
                                            title="Copy to Clipboard"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={displayedContent}
                                        onChange={(e) => setGeneratedContent(e.target.value)}
                                        className={`h-full w-full min-h-[440px] resize-none bg-transparent focus:outline-none text-lg leading-relaxed text-foreground/90 selection:bg-primary/30 ${isTyping ? 'typing-cursor' : ''}`}
                                        placeholder="Script content..."
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
