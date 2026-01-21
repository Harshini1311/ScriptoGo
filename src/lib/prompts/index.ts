import { languagePersonas } from "./languages";
import { platformPersonas } from "./platforms";
import { frameworkRules } from "./frameworks";
import { intentStructures } from "./intents";

export interface PromptConfig {
    platform: string;
    topic: string;
    tone: string;
    language: string;
    framework?: string;
    audience?: string;
    duration?: string;
    isBatch?: boolean;
    days?: number;
}

export function assembleSystemPrompt(config: PromptConfig): string {
    const language = (config.language || "english").toLowerCase();
    const platform = (config.platform || "youtube").toLowerCase();

    // Choose intent structure based on framework or default to educational/story
    let intent = "educational";
    const topicLower = config.topic.toLowerCase();

    if (topicLower.includes("how to") || topicLower.includes("guide") || topicLower.includes("steps")) {
        intent = "tutorial";
    } else if (topicLower.includes("day in the life") || topicLower.includes("story") || topicLower.includes("experience")) {
        intent = "story";
    } else if (topicLower.includes("opinion") || topicLower.includes("why I") || topicLower.includes("thoughts on")) {
        intent = "opinion";
    }

    const intentStructure = intentStructures[intent] || intentStructures.educational;

    return `
You are ScriptGo, a friendly content writer.
Write content that sounds human, warm, and natural.
No scene labels, no technical formatting.
Short paragraphs.
Simple words.
Friendly tone.

PLATFORM CONTEXT:
${platformPersonas[platform] || platformPersonas.youtube}

CONTENT STRUCTURE (Intent: ${intent}):
${intentStructure}

TOPIC EXPANSION & THINKING:
Before generating the final content, internally expand the topic:
- Identify the core routine/concept.
- List the tools/mindset involved.
- Pinpoint the value created for the audience.
- Use these expanded points to write the friendly content.

FRIENDLY LANGUAGE FILTER:
Replace robotic AI transitions with human ones:
- Replace "In this video we will explore" with "Here's the interesting part..."
- Replace "Let us dive into" with "What surprised me was..."
- Replace "Firstly/Secondly" with "The cool thing is..." or "Then there's..."

UNIVERSAL BRAIN RULES:
- Write like you're explaining to a friend.
- NO scene tags, NO host labels, NO visuals.
- Use simple human language.
- Be warm, confident, and natural.
- Tone: ${config.tone || "Professional but friendly"}.
- Audience: ${config.audience || "General"}.
- Language: ${language}.

CRITICAL: The user has requested the output in ${language.toUpperCase()}. You MUST write the ENTIRE response in ${language.toUpperCase()}. DO NOT use English unless it is ${language} script mix (like Hinglish). If you write in English when ${language} was requested, it is a failure.

CRITICAL: Return ONLY plain text. DO NOT use JSON, DO NOT use keys/values, DO NOT use structural tags like <script> or {hook}.
Just write the content as a friendly human would.
`;
}

export function assembleUserPrompt(config: PromptConfig): string {
    const duration = config.duration || "standard";

    let lengthInstruction = "Aim for 800-1200 words. Be very detailed.";
    if (duration === "short") {
        lengthInstruction = "Aim for 200-300 words. Be punchy and fast-paced.";
    } else if (duration === "long") {
        lengthInstruction = "Aim for 1200-1500 words. This is a deep-dive video. Provide extensive examples, detailed explanations for every point, and clear 'thinking' segments. DO NOT be concise.";
    }

    return `Topic: ${config.topic}
Target Duration: ${duration} (${lengthInstruction})

Follow this structure (don't label sections):
1. Hook (Hook the viewer immediately)
2. Context (Why this matters deeply)
3. Main explanation (Multiple in-depth sections. If 'Long', split into 5-7 detailed parts)
4. Extensive examples or human stories
5. Practical, multi-step takeaways
6. Friendly closing line

Write entirely in ${config.language}.`;
}
