
import { Ollama } from 'ollama';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
// CHANGED: trying https://ollama.com instead of api.ollama.com
const OLLAMA_HOST = 'https://ollama.com';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

console.log(`Connecting to ${OLLAMA_HOST} with model ${OLLAMA_MODEL}...`);

const ollama = new Ollama({
    host: OLLAMA_HOST,
    headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`
    }
});

async function main() {
    try {
        const response = await ollama.chat({
            model: OLLAMA_MODEL,
            messages: [{ role: 'user', content: 'Say "Hello, World!"' }],
        });
        console.log('Response:', response.message.content);
        console.log('Validation Successful!');

        // Also list models to see what is available
        // const list = await ollama.list();
        // console.log('Available models:', list);

    } catch (error) {
        console.error('Validation Failed:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

main();
