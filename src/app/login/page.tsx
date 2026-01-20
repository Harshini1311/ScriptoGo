"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setError("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center px-4 animate-fade-in">

            <div className="w-full max-w-md space-y-8 relative">
                <div className="text-center space-y-3">
                    <Link href="/" className="inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity mb-4">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold tracking-tight">ScriptGo</span>
                    </Link>
                    <h2 className="text-3xl font-semibold tracking-tight">
                        {isSignUp ? "Create your workspace" : "Welcome back"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isSignUp
                            ? "Start drafting structured content today."
                            : "Continue building your content library."}
                    </p>
                </div>

                <div className="rounded-md border border-border bg-card p-8 shadow-2xl animate-slide-up">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className={`rounded-md p-3 text-sm ${error.includes("Check") ? "bg-primary/5 text-primary border border-primary/10" : "bg-destructive/5 text-destructive border border-destructive/10"}`}>
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full rounded-md border border-border bg-secondary px-4 py-3 outline-none focus-glow transition-all placeholder:text-muted-foreground/30"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full rounded-md border border-border bg-secondary px-4 py-3 outline-none focus-glow transition-all placeholder:text-muted-foreground/30"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 shadow-sm"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                            <span>{isSignUp ? "Create account" : "Sign in"}</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        </span>{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="font-semibold text-primary hover:underline"
                        >
                            {isSignUp ? "Sign in" : "Create one for free"}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
