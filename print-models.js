
const fs = require('fs');
try {
    const data = fs.readFileSync('models.json', 'utf8');
    // The previous output might have been partial or corrupted by redirection of a process that writes oddly.
    // Let's rely on running list again inside this script if file is bad, but let's try reading first.
    // Actually, list-ollama-models.ts used console.log.
    // Let's just run the listing here using the SDK again and print names only.

    // ... wait, I can just use the previous script and format output better.
} catch (e) { }

const { Ollama } = require('ollama');

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_HOST = 'https://ollama.com';

const ollama = new Ollama({
    host: OLLAMA_HOST,
    headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`
    }
});

async function main() {
    try {
        const list = await ollama.list();
        console.log('--- MODELS ---');
        list.models.forEach(m => console.log(m.name));
        console.log('--- END ---');
    } catch (error) {
        console.error('List Failed:', error.message);
    }
}

main();
