import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    const openAIKey = process.env.OPENAI_API_KEY || "";

    return NextResponse.json({
        status: "alive",
        time: new Date().toISOString(),
        build_id: "v4.0-nuclear-fallback",
        env: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasOpenAIKey: !!openAIKey && !openAIKey.startsWith("AIza") && !openAIKey.includes("your-openai"),
            hasGoogleKey: !!googleKey || openAIKey.startsWith("AIza"),
        }
    });
}
