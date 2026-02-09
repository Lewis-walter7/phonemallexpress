
import { Ollama } from 'ollama';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_HOST = 'https://ollama.com'; // Trying this based on previous success connecting

const ollama = new Ollama({
    host: OLLAMA_HOST,
    headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`
    }
});

async function main() {
    try {
        console.log('Listing models...');
        const list = await ollama.list();
        console.log('Available models:', JSON.stringify(list, null, 2));
    } catch (error) {
        console.error('List Failed:', error);
    }
}

main();
