import { NextResponse } from "next/server";
import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { assembleSystemPrompt, assembleUserPrompt } from "@/lib/prompts";

// Initialized lazily inside POST to prevent build-time failures if key is missing
let openaiClient: OpenAI | null = null;
const getOpenAIClient = (apiKey: string) => {
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
};

async function generateWithGemini(prompt: string, apiKey: string) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 3000,
                temperature: 0.7,
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Gemini API Error");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";
}

// Premium Demo Examples (Golden Examples)
const GOLDEN_EXAMPLES: Record<string, string> = {
    "day in the life of an ai workflow developer": `
What most people think I do all day is type code into a terminal, but the reality is much more interesting. It’s actually about 20% coding and 80% teaching machines how to think through complex problems.

The fascinating part about my daily routine is how every morning starts with a "system check" on my latest automated agents. What surprised me was how much of my time is spent debugging logic rather than syntax. It’s like being a director on a movie set, but your actors are all digital brains.

I use tools like Python and LangChain to build these workflows, but the real secret isn't the code. It's the mindset of breaking down a large human task into tiny, logical steps. For example, last week I taught an agent how to research and summarize technical papers. Watching it work for the first time was incredibly rewarding.

The cool thing is that these workflows aren't just for techies. They’re for anyone who wants to reclaim their time from repetitive work. If you take one thing from my day, let it be this: don't just work harder; build systems that work for you.

Anyway, hope this gives you a window into my world. Talk soon!`,

    "how to bake sourdough": `
Baking sourdough always seemed like a dark art to me until I realized it's actually just a slow dance with biology. If you've been intimidated by starter and proofing, here's the honest truth: it's surprisingly simple once you get the rhythm.

The reason sourdough matters is that it’s more than just bread. It’s a process that forces you to slow down and connect with what you’re eating. What surprised me was that most of the "work" is actually just waiting.

Here’s the interesting part about the process: you start with just flour and water. The key is in the "stretch and fold"—instead of heavy kneading, you’re just gently encouraging the gluten to build strength. I remember my first loaf; it looked like a flat pancake, but it tasted like victory. That’s when I knew I was hooked.

The practical takeaway here is to start simple. Don’t worry about fancy tools or perfect scoring. Just get your hands in the dough and trust the process.

I'd love to see your first loaf when it comes out of the oven. Happy baking!`,

    "productivity tips": `
We’ve all been told that productivity is about doing more, but what if the secret is actually doing less? It sounds paradoxical, but the most productive people I know aren’t the busiest—they’re the most focused.

This matters because our energy is a finite resource. If you’re spreading it across fifty different tasks, you’re not making progress; you’re just spinning your wheels. The cool thing is that once you identify your "one big thing" each day, everything else starts to fall into place.

What really surprised me was the power of "deep work" blocks. I used to think I needed eight hours of focus, but I eventually found that two hours of truly uninterrupted work is worth more than a full day of "busy" distractions. For instance, I started leaving my phone in another room during my peak hours, and my output literally doubled in a week.

My simple tip for you today: pick one task that actually moves the needle and do it before you even open your inbox. 

Give it a try tomorrow morning and see how you feel. You've got this!`,

    "future of ai": `
There’s so much noise about AI taking over the world, but if you look closer, the reality is actually much more collaborative. We’re not heading toward a future where machines replace us; we’re heading toward a future where they augment our unique human creativity.

This shift matters because it changes the skills that will be valuable in the next decade. The interesting part is that technical skills are becoming easier to access, which means "soft" skills like empathy, critical thinking, and storytelling are becoming more important than ever.

What surprised me recently was seeing an AI help a designer sketch out 50 concepts in minutes, not to pick the best one, but to help the designer realize what *wasn't* working. It’s like having a brilliant, tireless assistant who never sleeps.

The practical takeaway? Don't fear the tools. Learn how to talk to them. The better you are at directing the machine, the more powerful your own voice becomes.

It’s an exciting time to be a creator. Let's see where this goes!`,

    "minimalism": `
I used to think minimalism was about having an empty room and a white t-shirt, but I eventually realized it’s actually about making space for what truly matters. It's not about subtraction for the sake of it; it's about intentionality.

The reason this changed my life is that we’re constantly being told we need more—more apps, more clothes, more commitments. But more often than not, "more" is just a distraction from the life we actually want to live.

Here’s the interesting part: when I started clearing the physical clutter, I noticed my mental clutter started to clear too. What surprised me was how much energy I was wasting on things I didn't even like. I started by getting rid of ten things a day, and within a month, I felt like a different person.

The takeaway is simple: look at your schedule or your room today and find one thing that doesn't add value. Let it go. You'll be surprised at how much lighter you feel.

Less is more, but only if you choose the right "less." Talk soon!`,

    "morning routine": `
We’ve all seen those "perfect" morning routines on social media that start at 4 AM with an ice bath, but here’s the secret: the best routine is the one you actually look forward to. It’s not about discipline; it’s about momentum.

The reason a good morning matters is that it sets the "weather" for the rest of your day. If you start in a rush, you’ll feel behind all day. But if you take even ten minutes for yourself, you’re telling your brain that *you* are in control.

What surprised me was that the most effective part of my morning isn't the coffee—it's the five minutes I spend sitting in silence before I check my phone. It’s like clearing the windshield before you start driving. I used to reach for my emails the second I woke up, and it made me feel like I was starting every day in a defensive crouch.

My tip for you? Choose one tiny habit—just one—that makes you feel calm, and do it before you touch your phone tomorrow morning.

One small win can change everything. See you in the next one!`,
};

const LOCALIZED_FALLBACKS: Record<string, any> = {
    hindi: {
        hook: "क्या आप जानते हैं कि 'Logic before storytelling' आपकी सफलता की सबसे बड़ी चाबी है?",
        intro: "आज कल हर कोई कंटेंट बना रहा है, लेकिन यहाँ एक दिलचस्प बात है: जो लोग सफल होते हैं, वे सिर्फ कहानियां नहीं सुनाते, वे पहले लॉजिक पर काम करते हैं।",
        insight: "मुझे यह जानकर हैरानी हुई कि छोटे बदलाव, जैसे कि अपने रूटीन में सिर्फ 15 मिनट देना, आपके कंटेंट को 2x बेहतर बना सकता है।",
        outro: "तो छोटे कदम उठाएं और अपनी आवाज़ को दुनिया तक पहुंचाएं। मिलते हैं अगले वीडियो में!",
        bridge: "के बारे में बात करते हुए..."
    },
    tamil: {
        hook: "கையில போன் இருக்கு, ஆனா என்ன கன்டென்ட் பண்றதுன்னு தெரியலையா?",
        intro: "இங்க ஒரு முக்கியமான விஷயம் இருக்கு: கன்டென்ட் கிரியேஷன்ங்கிறது ஒரு பெரிய வித்தை இல்ல, அது உங்களோட வாய்ஸ்-அ சரியா கொண்டு வர்றதுதான்.",
        insight: "நான் கத்துக்கிட்ட ஒரு விஷயம் என்னன்னா, பெருசா யோசிக்கிறத விட, சின்ன சின்ன விஷயங்கள கரெக்டா பண்றதுதான் ரீச் தரும்.",
        outro: "உங்க கன்டென்ட்-அ ஆரம்பிங்க, கண்டிப்பா ஒரு நாள் பெரிய லெவல்ல வரும். அடுத்த வீடியோல பாப்போம்!",
        bridge: "பற்றி பேசுகையில்..."
    },
    telugu: {
        hook: "కంటెంట్ క్రియేషన్ లో సక్సెస్ అవ్వాలంటే ఈ ఒక్కటి చాలు!",
        intro: "ఒక ఆసక్తికరమైన విషయం ఏంటంటే: కంటెంట్ లో 'లాజిక్' ఉంటేనే ఆడియన్స్ కనెక్ట్ అవుతారు.",
        insight: "నేను గమనించిన విషయం ఏమిటంటే, సింపుల్ గా ఉంటేనే ఎక్కువ మందికి చేరుతుంది.",
        outro: "మరిన్ని విశేషాలతో మళ్ళీ కలుద్దాం. అప్పటివరకు కీప్ క్రియేటింగ్!",
        bridge: "గురించి మాట్లాడుకుంటే..."
    },
    spanish: {
        hook: "¿Sabías que la mayoría de los creadores se rinden antes de los 3 meses?",
        intro: "Lo interesante de esto es que no es por falta de talento, sino por falta de un sistema.",
        insight: "Lo que me sorprendió fue darme cuenta de que 15 minutos de enfoque valen más que 2 horas de distracción.",
        outro: "¡Sigue adelante y nos vemos en la próxima!",
        bridge: "Hablando de..."
    },
    french: {
        hook: "Pourquoi 90% des créateurs échouent-ils dès la première année ?",
        intro: "Ce qui est fascinant, c'est que ce n'est pas une question de chance, mais de structure.",
        insight: "J'ai été surpris de voir à quel point la simplicité attire l'attention.",
        outro: "À bientôt pour la suite !",
        bridge: "En parlant de..."
    }
};

function getDemoContent(topic: string, platform: string, language: string = "english", duration: string = "standard"): string {
    const langLower = language.toLowerCase();
    const topicLower = topic.toLowerCase();

    let content = "";

    // Check localized fallback first
    if (langLower !== "english" && LOCALIZED_FALLBACKS[langLower]) {
        const local = LOCALIZED_FALLBACKS[langLower];
        content = `${local.hook}\n\n${local.intro} ${local.bridge} "${topic}"\n\n${local.insight}\n\n${local.outro}`;
    } else {
        // Try to find a direct match or a keyword match in Golden Examples
        let matchedExample = "";
        for (const key in GOLDEN_EXAMPLES) {
            if (topicLower.includes(key)) {
                matchedExample = GOLDEN_EXAMPLES[key];
                break;
            }
        }

        if (matchedExample) {
            content = matchedExample;
        } else {
            // Fallback for unknown topics in demo mode
            content = `Here’s the interesting part about "${topic}": it’s a topic that many people overcomplicate, but when you break it down, it’s really about simple, impactful actions.

What surprised me was how much value you can create in this space just by being consistent. The cool thing is that whether you're using a professional framework or just sharing your personal journey, the most important element is staying true to your unique voice.

What most people miss is that success with "${topic}" isn't about the tools you use, it's about the connection you build. For example, a small project I started last month taught me that a focused 15-minute routine is better than a vague 2-hour plan.

The practical takeaway? Start small, stay curious, and don't be afraid to experiment with your content on ${platform}.`;
        }
    }

    // Apply duration adjustments
    if (duration === "short") {
        const lines = content.split('\n').filter(l => l.trim());
        return lines.slice(0, 3).join('\n\n') + (langLower === "hindi" ? "\n\n(डेमो के लिए छोटा संस्करण)" : "\n\n(Short version for demo)");
    } else if (duration === "long") {
        let extraDepth = "";

        if (langLower === "hindi") {
            extraDepth = `\n\n[गहन विश्लेषण अनुभाग]\n"${topic}" में वास्तव में महारत हासिल करने के लिए, हमें इसके मूल सिद्धांतों को समझने की आवश्यकता है। अधिकांश लोग केवल सतही ज्ञान से संतुष्ट हो जाते हैं, लेकिन असली लाभ हर क्रिया के पीछे के "क्यों" को समझने से मिलता है।

मेरे अनुभव में, जब आप एक दीर्घकालिक दृष्टिकोण के माध्यम से "${topic}" का विश्लेषण करते हैं, तो ऐसे पैटर्न उभर कर आते हैं जो एक सामान्य दर्शक को दिखाई नहीं देते। उदाहरण के लिए, मैंने इस विषय पर लोगों की प्रतिक्रियाओं का दस्तावेजीकरण करने में सैकड़ों घंटे बिताए हैं, और परिणाम आश्चर्यजनक हैं।

[विस्तृत विश्लेषण]\nहमने यह भी पाया है कि वह वातावरण जिसमें आप "${topic}" लागू करते हैं, उतना ही महत्वपूर्ण है जितना कि स्वयं इसका अनुप्रयोग। यदि आप उच्च-दबाव वाली स्थिति में काम कर रहे हैं, तो आपका दृष्टिकोण अधिक लचीला और अनुकूलनीय होना चाहिए।

[दीर्घकालिक सामग्री के लिए व्यावहारिक कदम]\n1. अपनी वर्तमान समझ का गहन ऑडिट करें।
2. उन शीर्ष 3 बाधाओं की पहचान करें जो आपको आगे बढ़ने से रोकती हैं।
3. 30 दिनों का "इमर्सिव" चरण लागू करें जहां आप विशेष रूप से इन बिंदुओं पर ध्यान केंद्रित करते हैं।

ऐसा करने से, आप केवल "${topic}" के बारे में सीख नहीं रहे हैं; आप इसमें विशेषज्ञ बन रहे हैं। गहराई का यही स्तर सामग्री के क्षेत्र में उस्तादों को नौसिखियों से अलग करता है।`;
        } else if (langLower === "spanish") {
            extraDepth = `\n\n[SECCIÓN DE ANÁLISIS PROFUNDO]\nPara dominar verdaderamente "${topic}", necesitamos observar los principios subyacentes. La mayoría de las personas se conforman con un conocimiento superficial, pero la verdadera ventaja proviene de comprender el "por qué" detrás de cada acción.

En mi experiencia, cuando analizas "${topic}" a través de una lente a largo plazo, surgen patrones que son invisibles para el observador casual. Por ejemplo, he pasado cientos de horas documentando los cambios sutiles en cómo las personas interactúan con este tema, y los resultados son alucinantes.

[ANÁLISIS EXTENDIDO]\nTambién hemos descubierto que el entorno en el que aplicas "${topic}" importa tanto como la aplicación misma. Si trabajas en un entorno de alta presión, tu enfoque debe ser más resistente y adaptativo.

[PASOS PRÁCTICOS PARA LARGO FORMATO]\n1. Comienza con una auditoría profunda de tu comprensión actual.
2. Identifica los 3 puntos de fricción principales que te impiden progresar.
3. Implementa una fase de "inmersión" de 30 días donde te concentres exclusivamente en estos puntos.

Al hacer esto, no solo estás aprendiendo sobre "${topic}"; te estás convirtiendo en un experto. Este nivel de profundidad es lo que separa a los maestros de los aficionados en el juego del contenido.`;
        } else if (langLower === "french") {
            extraDepth = `\n\n[SECTION D'ANALYSE APPROFONDIE]\nPour maîtriser véritablement "${topic}", nous devons examiner les principes sous-jacents. La plupart des gens se contentent de connaissances superficielles, mais le véritable avantage vient de la compréhension du "pourquoi" derrière chaque action.

D'après mon expérience, lorsque vous analysez "${topic}" sous un angle à long terme, des modèles émergent qui sont invisibles pour l'observateur occasionnel. Par exemple, j'ai passé des centaines d'heures à documenter les changements subtils dans la façon dont les gens interagissent avec ce sujet, et les résultats sont époustouflants.

[ANALYSE ÉTENDUE]\nNous avons également constaté que l'environnement dans lequel vous appliquez "${topic}" importe autant que l'application elle-même. Si vous travaillez dans un environnement à haute pression, votre approche doit être plus résiliente et adaptative.

[ÉTAPES PRATIQUES POUR LE LONG FORMAT]\n1. Commencez par un audit approfondi de votre compréhension actuelle.
2. Identifiez les 3 principaux points de friction qui vous empêchent de progresser.
3. Mettez en œuvre une phase d'immersion de 30 jours où vous vous concentrez exclusivement sur ces points.

En faisant cela, vous n'apprenez pas seulement "${topic}" ; vous en devenez un expert. Ce niveau de profondeur est ce qui sépare les maîtres des amateurs dans le jeu du contenu.`;
        } else if (langLower === "tamil") {
            extraDepth = `\n\n[ஆழமான பகுப்பாய்வு பிரிவு]\n"${topic}" இல் உண்மையிலேயே தேர்ச்சி பெற, அதன் அடிப்படை கொள்கைகளை நாம் கவனிக்க வேண்டும். பெரும்பாலான மக்கள் மேலோட்டமான அறிவோடு திருப்தி அடைகிறார்கள், ஆனால் உண்மையான நன்மை ஒவ்வொரு செயலுக்கும் பின்னால் உள்ள "ஏன்" என்பதைப் புரிந்துகொள்வதன் மூலம் கிடைக்கிறது.

என்னுடைய அனுபவத்தில், "${topic}" ஐ நீண்ட கால நோக்கில் பகுப்பாய்வு செய்யும் போது, சாதாரண பார்வையாளர்களுக்குத் தெரியாத வடிவங்கள் வெளிப்படுகின்றன. உதாரணமாக, இந்த விஷயத்தில் மக்கள் எவ்வாறு தொடர்பு கொள்கிறார்கள் என்பதில் உள்ள நுட்பமான மாற்றங்களை ஆவணப்படுத்துவதில் நான் நூற்றுக்கணக்கான மணிநேரங்களைச் செலவிட்டுள்ளேன், அதன் முடிவுகள் வியக்க வைக்கின்றன.

[விரிவான விளக்கம்]\n"${topic}" ஐ நீங்கள் செயல்படுத்தும் சூழல், செயல்பாட்டைப் போலவே முக்கியமானது என்பதையும் நாங்கள் கண்டறிந்துள்ளோம். நீங்கள் அதிக அழுத்தம் உள்ள சூழலில் பணிபுரிகிறீர்கள் என்றால், உங்கள் அணுகுமுறை மிகவும் நெகிழ்வானதாகவும் மாற்றியமைக்கக்கூடியதாகவும் இருக்க வேண்டும்.

[நீண்ட கால உள்ளடக்கத்திற்கான படிகள்]\n1. உங்கள் தற்போதைய புரிதலின் ஆழமான தணிக்கையுடன் தொடங்கவும்.
2. நீங்கள் முன்னேறுவதைத் தடுக்கும் முதல் 3 உராய்வு புள்ளிகளைக் கண்டறியவும்.
3. இந்த புள்ளிகளில் பிரத்தியேகமாக கவனம் செலுத்தும் 30 நாள் "மூழ்கும்" கட்டத்தை செயல்படுத்தவும்.

இதைச் செய்வதன் மூலம், நீங்கள் "${topic}" பற்றி மட்டும் கற்றுக்கொள்ளவில்லை; நீங்கள் அதில் நிபுணராகிறீர்கள். ஆழத்தின் இந்த நிலைதான் உள்ளடக்க விளையாட்டில் மேஸ்திரிகளை ஆரம்பநிலையாளர்களிடமிருந்து பிரிக்கிறது.`;
        } else if (langLower === "telugu") {
            extraDepth = `\n\n[లోతైన విశ్లేషణ విభాగం]\n"${topic}" లో నిజంగా ప్రావీణ్యం సంపాదించాలంటే, మనం దాని ప్రాథమిక సూత్రాలను గమనించాలి. చాలా మంది ఉపరితల స్థాయి జ్ఞానంతోనే సంతృప్తి చెందుతారు, కానీ అసలు ప్రయోజనం ప్రతి చర్య వెనుక ఉన్న "ఎందుకు" అనే కారణాన్ని అర్థం చేసుకోవడం ద్వారా వస్తుంది.

నా అనుభవంలో, మీరు "${topic}" ను దీర్ఘకాలిక కోణంలో విశ్లేషించినప్పుడు, సాధారణ పరిశీలకుడికి కనిపించని నమూనాలు బయటపడతాయి. ఉదాహరణకు, ఈ అంశంతో ప్రజలు ఎలా సంభాషిస్తారు అనే అంశంలో ఉన్న సూక్ష్మ మార్పులను డాక్యుమెంట్ చేయడంలో నేను వందల గంటలు గడిపాను, ఫలితాలు ఆశ్చర్యకరంగా ఉన్నాయి.

[వివరణాత్మక విశ్లేషణ]\nమీరు "${topic}" ను వర్తింపజేసే వాతావరణం కూడా దాని అప్లికేషన్ అంత ముఖ్యమని మేము కనుగొన్నాము. మీరు అధిక ఒత్తిడి ఉన్న వాతావరణంలో పని చేస్తుంటే, మీ విధానం మరింత స్థితిస్థాపకంగా మరియు అనుకూలమైనదిగా ఉండాలి.

[దీర్ഘకాలిక కంటెంట్ కోసం దశలు]\n1. మీ ప్రస్తుత్త అవగాహనపై లోతైన ఆడిట్‌తో ప్రారంభించండి.
2. మీరు పురోగమించకుండా అడ్డుకునే మొదటి 3 ఘర్షణ పాయింట్లను గుర్తించండి.
3. ఈ పాయింట్లపై ప్రత్యేకంగా దృష్టి సారించే 30 రోజుల "నిమగ్నత" దశను అమలు చేయండి.

ఇలా చేయడం ద్వారా, మీరు "${topic}" గురించి కేవలం తెలుసుకోవడమే కాదు; మీరు అందులో నిపుణులు అవుతున్నారు. కంటెంట్ రంగంలో మాస్టర్స్ మరియు అమెచ్యూర్ల మధ్య వ్యత్యాసాన్ని చూపేది ఈ లోతే.`;
        } else {
            extraDepth = `\n\n[DEEP DIVE SECTION]\nTo truly master "${topic}", we need to look at the underlying principles. Most people settle for surface-level knowledge, but the real advantage comes from understanding the "why" behind every action.

In my experience, when you analyze "${topic}" through a long-term lens, patterns emerge that are invisible to the casual observer. For instance, I've spent hundreds of hours documenting the subtle shifts in how people interact with this subject, and the results are mind-blowing.

[EXTENDED ANALYSIS]\nWe've also found that the environment in which you apply "${topic}" matters as much as the application itself. If you're working in a high-pressure setting, your approach needs to be more resilient and adaptive.

[PRACTICAL STEPS FOR LONG-FORM]\n1. Start with a deep audit of your current understanding.
2. Identify the top 3 friction points that stop you from progressing.
3. Implement a 30-day "immersion" phase where you focus exclusively on these points.

By doing this, you're not just learning about "${topic}"; you're becoming an expert in it. This level of depth is what separates the masters from the amateurs in the content game.`;
        }

        return content + extraDepth;
    }

    return content;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { platform, topic, tone, language, framework, audience } = body;

        logger.info(`Generating content for ${platform}`, { topic, tone });

        const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            (process.env.OPENAI_API_KEY?.startsWith("AIza") ? process.env.OPENAI_API_KEY : null);
        const openAIKey = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("AIza") ? process.env.OPENAI_API_KEY : null;

        const isDemo = (!googleKey && !openAIKey) ||
            (openAIKey === "your-openai-api-key") ||
            (openAIKey?.includes("your-openai"));

        if (isDemo) {
            logger.warn(`Using demo mode (Language: ${language}, Duration: ${body.duration})`);
            const content = getDemoContent(topic, platform, language, body.duration);
            return NextResponse.json({ content });
        }

        const systemPrompt = assembleSystemPrompt({ platform, topic, tone, language, framework, audience, duration: body.duration });
        const userPrompt = assembleUserPrompt({ platform, topic, tone, language, framework, audience, duration: body.duration });
        const combinedPrompt = `${systemPrompt}\n\nTask: ${userPrompt}`;

        let content = "";

        if (googleKey) {
            logger.info("Using Google Gemini for generation");
            content = await generateWithGemini(combinedPrompt, googleKey);
        } else if (openAIKey) {
            logger.info("Using OpenAI for generation");
            const openai = getOpenAIClient(openAIKey);
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                model: "gpt-4o-mini",
                max_tokens: 3000,
                temperature: 0.7,
            });
            content = completion.choices[0].message.content || "";
        }

        logger.info("Content generation successful");

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("GENERATION_ERROR:", error);

        const details = error.response?.data?.error?.message || error.message || "Unknown Error";
        const status = error.status || error.response?.status || 500;

        logger.error(`Generation Failed: ${details}`);

        return NextResponse.json(
            {
                error: "Generation Failed",
                details: details,
                code: error.code || "UNKNOWN_ERROR"
            },
            { status: status }
        );
    }
}
