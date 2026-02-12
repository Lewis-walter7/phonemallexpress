import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
// Removed 'ollama' import to use fetch for better control

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
// Ensure host doesn't have trailing slash for cleaner concatenation
const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'https://ollama.com').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Helper to ensure roles alternate: user -> assistant -> user...
function normalizeMessages(messages: any[]) {
    if (!messages || messages.length === 0) return [];

    const normalized: any[] = [];
    let lastRole: string | null = null;

    for (const msg of messages) {
        const role = msg.role;
        const content = msg.content;

        if (role === 'system') continue; // Skip system messages from client, we add our own

        if (role === lastRole) {
            // Merge consecutive messages of the same role
            normalized[normalized.length - 1].content += `\n\n${content}`;
        } else {
            normalized.push({ role, content });
            lastRole = role;
        }
    }

    // Ensure the conversation starts with a 'user' message (after the system prompt)
    // If the first message is 'assistant', remove it.
    if (normalized.length > 0 && normalized[0].role === 'assistant') {
        normalized.shift();
    }

    return normalized;
}

export async function POST(req: Request) {
    if (!OLLAMA_API_KEY) {
        return NextResponse.json({ error: 'Ollama API key not configured' }, { status: 500 });
    }

    let messages;
    try {
        const body = await req.json();
        messages = body.messages || [];
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Rate Limiting Logic
    const cookieStore = await cookies();
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `chat_usage_${today}`;
    const currentUsage = parseInt(cookieStore.get(usageKey)?.value || '0');

    // Check if message is a greeting (to exclude from limit)
    const lastUserMessage = messages[messages.length - 1]?.content?.trim() || "";
    // Sanitize for regex - escape special chars
    const safeQuery = lastUserMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 50); // limit length

    const GREETINGS = ['hi', 'hello', 'hey', 'hi there', 'hello there', 'hallo', 'greetings', 'habari', 'sasa', 'good morning', 'good afternoon', 'good evening'];

    // Strict match or starts with (e.g. "Hi there") - but aim to catch short greetings mostly
    const isGreeting = GREETINGS.some(g => lastUserMessage.toLowerCase() === g || (lastUserMessage.toLowerCase().startsWith(g + '') && lastUserMessage.length < 15));

    if (!isGreeting && currentUsage >= 12) {
        return NextResponse.json({
            error: 'You have reached your daily limit of 12 messages. Please contact us on WhatsApp for unlimited support.'
        }, { status: 429 });
    }

    try {
        await dbConnect();

        // Context Retrieval (RAG-lite)
        let productContext = "";

        // Only search if not a greeting and query is long enough
        if (!isGreeting && safeQuery.length > 2) {
            const products = await Product.find({
                status: 'published',
                $or: [
                    { name: { $regex: safeQuery, $options: 'i' } },
                    { brand: { $regex: safeQuery, $options: 'i' } },
                    { category: { $regex: safeQuery, $options: 'i' } },
                    { subcategory: { $regex: safeQuery, $options: 'i' } }
                ]
            })
                .select('name price stock brand category')
                .limit(5)
                .lean();

            if (products.length > 0) {
                const productList = products.map((p: any) =>
                    `- ${p.name} (${p.brand}): KES ${p.price.toLocaleString()} | Stock: ${p.stock}`
                ).join('\n');

                productContext = `
                CONTEXT FROM DATABASE:
                The following products match the user's query. Use this EXACT information to answer price/stock questions.
                ${productList}
                
                If the user asks for a specific product and it is NOT in the list above, assume we do not have it or it is out of stock.
                `;
            }
        }

        const systemMessage = {
            role: "system",
            content: `You are the AI Assistant for Phone Mall Express.
            
            ${productContext}
            
            Key Business Information:
            - LOCATION: Old Mutual Building, First Floor, Suite 105, Nairobi CBD.
            - CONTACT: Call or WhatsApp +254718948929.
            - WEBSITE: phonemallexpress.com (Online retailer, but we have a pickup location).
            
            STRICT RULES:
            1. SCOPE: You are authorized to discuss the following product categories found in our menu:
               - Smartphones & Tablets (iPhone, Samsung, Tecno, Infinix, Xiaomi, iPad, etc.)
               - Computing (Laptops, Desktops, Monitors, Printers)
               - TVs & Audio (Smart TVs, Soundbars, Home Theaters, Bluetooth Speakers)
               - Home Appliances (Refrigerators, Washing Machines)
               - Kitchen Ware (Cookers, Airfryers, Blenders, Kettles)
               - Cameras (Digital & Security)
               - Gaming (Consoles & Accessories)
               - Smart Wearables (Watches, Bands, Rings)
               - Mobile & TV Accessories (Cases, Chargers, TV Remotes, Brackets, etc.)
               - Repairs & Services
            
            2. OUT OF SCOPE: Do NOT discuss products we do not sell (e.g., Furniture, Clothing, Auto Parts, etc.). If asked, politely decline and list our focus areas.

            3. Keep answers concise (under 3 sentences where possible).
            4. Be friendly and helpful.
            5. PRICES: If you have context data, quote the exact KES price. If not, ask the user to check the website or contact support.
            
            Your goal is to help customers find the right tech gadget, schedule a repair, or find our shop.`
        };

        // Normalize History
        const history = normalizeMessages(messages);

        // Final sanity check: if history is empty (e.g. user sent only system messages?), fallback
        if (history.length === 0) {
            // Should verify at least one user message?
            // But if we're here, messages was parsed.
            // If normalize removed everything, let's allow it to proceed with just system prompt?
            // Ollama will error if no user message? The error said "roles must alternate", implying system -> user -> assistant.
            // If history is empty, we just send system message?
        }

        const payload = {
            model: OLLAMA_MODEL,
            messages: [systemMessage, ...history],
            stream: false
        };

        // Use fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OLLAMA_API_KEY}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API Error (${response.status}): ${errorText}`);
        }

        const data: any = await response.json();

        // Return success response with updated cookie ONLY if not a greeting
        // Ollama response format: { model, created_at, message: { role, content }, done }
        const adaptedResponse = {
            choices: [
                {
                    message: {
                        content: data.message?.content || ""
                    }
                }
            ]
        };

        const res = NextResponse.json(adaptedResponse);

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
