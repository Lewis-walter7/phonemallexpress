
const fetch = require('node-fetch'); // Or use global fetch if in Bun environment

async function testChat() {
    console.log('Testing /api/chat with initial Assistant message...');

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'assistant', content: 'Hi! I am the initial greeting.' },
                    { role: 'user', content: 'Hello, are you working?' }
                ]
            })
        });

        if (response.ok) {
            console.log('SUCCESS: API returned 200 OK');
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.error(`FAILED: API returned ${response.status}`);
            const text = await response.text();
            console.error('Error Body:', text);
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

testChat();
