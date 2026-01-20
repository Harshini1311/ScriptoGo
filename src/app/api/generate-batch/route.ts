import { NextResponse } from "next/server";
import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { assembleSystemPrompt } from "@/lib/prompts";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { platform, topic, tone, language, framework, days, audience } = body;

        logger.info(`Starting batch generation for ${days} days`, { platform, topic });

        if (!process.env.OPENAI_API_KEY) {
            logger.warn("OpenAI API key missing in batch generation, using demo mode");
            const mockScripts = Array.from({ length: days }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return {
                    topic: `${topic} - Day ${i + 1}`,
                    content: `[DEMO] Script for ${platform} about ${topic}. Day ${i + 1} focus: Specific tip or engagement hook.`,
                    scheduled_date: date.toISOString(),
                };
            });
            return NextResponse.json({ scripts: mockScripts });
        }

        const systemPrompt = assembleSystemPrompt({
            platform,
            topic,
            tone,
            language,
            framework,
            days,
            audience,
            isBatch: true
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo-0125",
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"scripts":[]}');
        logger.info(`Batch generation successful for ${days} days`);

        return NextResponse.json(result);
    } catch (error: any) {
        logger.error("Batch Generation Error:", {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: "Batch Generation Failed", details: error.message },
            { status: 500 }
        );
    }
}
