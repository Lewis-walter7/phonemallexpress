import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
    if (!OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let messages;
    try {
        const body = await req.json();
        messages = body.messages;
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Rate Limiting Logic
    const cookieStore = await cookies();
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `chat_usage_${today}`;
    const currentUsage = parseInt(cookieStore.get(usageKey)?.value || '0');

    // Check if message is a greeting (to exclude from limit)
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase().trim() || "";
    const GREETINGS = ['hi', 'hello', 'hey', 'greetings', 'habari', 'sasa', 'good morning', 'good afternoon', 'good evening'];

    // Strict match or starts with (e.g. "Hi there") - but aim to catch short greetings mostly
    const isGreeting = GREETINGS.some(g => lastUserMessage === g || (lastUserMessage.startsWith(g + '') && lastUserMessage.length < 15));

    if (!isGreeting && currentUsage >= 6) {
        return NextResponse.json({
            error: 'You have reached your daily limit of 6 messages. Please contact us on WhatsApp for unlimited support.'
        }, { status: 429 });
    }

    try {
        const systemMessage = {
            role: "system",
            content: `You are the AI Assistant for Phone Mall Express.
            
            STRICT RULES:
            1. SCOPE: You are authorized to discuss the following product categories found in our menu:
               - Smartphones & Tablets (iPhone, Samsung, Tecno, Infinix, Xiaomi, iPad, etc.)
               - Computing (Laptops, Desktops, Monitors, Printers)
               - TVs & Audio (Smart TVs, Soundbars, Home Theaters, Bluetooth Speakers, Earbuds, Headphones)
               - Cameras (Digital & Security)
               - Gaming (Consoles & Accessories)
               - Smart Wearables (Watches, Bands, Rings)
               - Mobile Accessories (Cases, Chargers, Storage, etc.)
               - Repairs & Services
            
            2. OUT OF SCOPE: Do NOT discuss products we do not sell (e.g., Home Appliances like Fridges/Cookers, Furniture, Clothing, etc.). If asked, politely decline and list our focus areas.

            3. Keep answers concise (under 3 sentences where possible).
            4. Be friendly and helpful.
            
            Your goal is to help customers find the right tech gadget or repair service.`
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [systemMessage, ...messages],
                temperature: 0.5,
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from OpenAI');
        }

        // Return success response with updated cookie ONLY if not a greeting
        const res = NextResponse.json(data);

        if (!isGreeting) {
            res.cookies.set(usageKey, (currentUsage + 1).toString(), {
                maxAge: 86400, // 24 hours
                path: '/',
            });
        }

        return res;

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
