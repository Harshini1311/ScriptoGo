import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
    const diagnostics = {
        supabase: {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            connection: "untested"
        },
        openai: {
            hasKey: !!process.env.OPENAI_API_KEY,
            isDemo: !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your-openai")
        },
        environment: process.env.NODE_ENV
    };

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: () => undefined } }
        );
        const { error } = await supabase.from("scripts").select("count").limit(1);
        diagnostics.supabase.connection = error ? `Error: ${error.message}` : "Success";
    } catch (e: any) {
        diagnostics.supabase.connection = `Exception: ${e.message}`;
    }

    return NextResponse.json(diagnostics);
}
