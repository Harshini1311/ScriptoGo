import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
    return NextResponse.json({
        status: "alive",
        time: new Date().toISOString(),
        env: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("AIza"),
            hasGoogleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY || (!!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("AIza")),
        }
    });
}
