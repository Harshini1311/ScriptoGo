"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Calendar as CalendarIcon,
    FileText,
    Trash2,
    ExternalLink,
    Zap,
    Youtube,
    Linkedin,
    Search,
    LayoutGrid,
    List
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Footer from "@/components/Footer";
import OnboardingTip from "@/components/OnboardingTip";

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();
    const [scripts, setScripts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [localBackups, setLocalBackups] = useState<any[]>([]);

    useEffect(() => {
        fetchScripts();
        checkLocalBackups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkLocalBackups = () => {
        try {
            const backups = JSON.parse(localStorage.getItem("scriptgo_backups") || "[]");
            setLocalBackups(backups);
        } catch (e) {
            console.error("Failed to load local backups", e);
        }
    };

    const fetchScripts = async () => {
        try {
            setLoading(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                router.push("/login");
                return;
            }

            const { data, error } = await supabase
                .from("scripts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.warn("Supabase fetch failed, relying on local storage if available.");
            } else if (data) {
                setScripts(data);
            }
        } catch (err) {
            console.error("Unexpected fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (content: any) => {
        if (!content) return "No content generated yet.";
        if (typeof content === 'string') return content;
        if (typeof content === 'object') {
            // Try to join values if it's a structured object
            return Object.values(content).filter(v => typeof v === 'string').join(" ");
        }
        return String(content);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("scripts").delete().eq("id", id);
        if (!error) {
            setScripts(scripts.filter((s) => s.id !== id));
            showToast("Script deleted successfully", "success");
        }
    };

    const filteredScripts = scripts.filter(s => {
        const query = searchQuery.toLowerCase();
        const topic = (s.topic || "").toLowerCase();
        const content = renderContent(s.content).toLowerCase();
        return topic.includes(query) || content.includes(query);
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="h-8 w-8 text-primary animate-pulse" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-foreground animate-fade-in flex flex-col">
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                            <Zap className="h-5 w-5 text-primary" />
                            <span className="text-xl font-bold tracking-tight">ScriptGo</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <Link href="/dashboard" className="text-foreground font-semibold border-b-2 border-primary py-1">Dashboard</Link>
                            <Link href="/calendar" className="text-muted-foreground hover:text-foreground transition-colors">Calendar</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sign Out
                        </button>
                        <Link
                            href="/editor"
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create script</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl w-full px-6 pt-12 flex-1">
                {localBackups.length > 0 && (
                    <div className="mb-12 p-4 rounded-md border border-primary/20 bg-primary/5 flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-semibold">Local Backups Detected ({localBackups.length})</p>
                                <p className="text-xs text-muted-foreground">These scripts were saved to your browser due to a database issue.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("scriptgo_backups");
                                setLocalBackups([]);
                                showToast("Local backups cleared", "success");
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-semibold mb-2 tracking-tight">Your workspaces</h1>
                        <p className="text-sm text-muted-foreground">Manage and edit your content drafts.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search drafts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 rounded-md border border-border bg-secondary pl-9 pr-4 py-2 text-sm outline-none focus-glow transition-all"
                            />
                        </div>
                        <div className="flex border border-border rounded-md p-1 bg-secondary shadow-sm">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-white/5'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-white/5'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredScripts.length === 0 && localBackups.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border bg-secondary/20 py-32 text-center animate-slide-up">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-secondary text-primary border border-border/50">
                            <Zap className="h-8 w-8 text-primary/60" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2 tracking-tight text-foreground">No scripts found</h2>
                        <p className="text-muted-foreground mb-8 text-sm max-w-sm mx-auto">Start your creative journey by generating your first script.</p>
                        <Link
                            href="/editor"
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Create your first script
                        </Link>
                    </div>
                ) : (
                    <div className={view === 'grid' ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                        {/* Local Backups */}
                        {localBackups.map((script) => (
                            <div
                                key={script.id}
                                className={`glass-card group relative overflow-hidden p-6 border-dashed border-primary/40 bg-primary/5 animate-pulse ${view === 'list' ? 'flex items-center gap-6 py-4' : ''}`}
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-md border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                                        LOCAL BACKUP
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newBackups = localBackups.filter(b => b.id !== script.id);
                                            localStorage.setItem("scriptgo_backups", JSON.stringify(newBackups));
                                            setLocalBackups(newBackups);
                                        }}
                                        className="p-1.5 rounded-md bg-secondary text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm z-20 border border-border"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <h3 className="mb-4 text-xl font-bold line-clamp-2 leading-tight">
                                    {script.topic || "Untitled Script"}
                                </h3>
                                <p className="mb-8 text-sm leading-relaxed text-muted-foreground line-clamp-3 italic">
                                    {renderContent(script.content)}
                                </p>
                                <div className="text-[10px] font-bold text-primary/60 uppercase">
                                    Saved locally on {new Date(script.created_at || Date.now()).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}

                        {/* Database Scripts */}
                        {filteredScripts.map((script, idx) => (
                            <div
                                key={script.id}
                                className={view === 'grid' ? "glass-card group relative overflow-hidden p-6 animate-slide-up" : "glass-card flex items-center gap-6 p-4 hover:scale-[1.01] active:scale-[0.99] animate-slide-up"}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                {view === 'grid' ? (
                                    <>
                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md border border-border bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {script.platform}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                                                    {new Date(script.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleDelete(script.id); }}
                                                    className="p-1.5 rounded-md bg-secondary text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm z-20 border border-border"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="mb-4 text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {script.topic || "Untitled Script"}
                                        </h3>
                                        <p className="mb-8 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                                            {renderContent(script.content)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                                            <Zap className="h-3 w-3 text-primary/60" />
                                            {script.framework || "Direct AI"}
                                            <Link href={`/editor/${script.id}`} className="ml-auto text-primary flex items-center gap-1">
                                                Edit <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                        <Link href={`/editor/${script.id}`} className="absolute inset-0 z-10" />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/5 text-primary border border-primary/10">
                                            {script.platform === 'youtube' ? <Youtube className="h-5 w-5" /> : <Linkedin className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold truncate">{script.topic || "Untitled Script"}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{renderContent(script.content)}</p>
                                        </div>
                                        <div className="hidden md:block text-sm font-medium text-muted-foreground">
                                            {new Date(script.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/editor/${script.id}`} className="p-2 rounded-md hover:bg-secondary text-primary">
                                                <FileText className="h-5 w-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(script.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <OnboardingTip />
            </main>
            <Footer />
            {ToastComponent}
        </div>
    );
}
