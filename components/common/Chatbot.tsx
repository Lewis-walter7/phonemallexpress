"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import './Chatbot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! How can I help you find the perfect gadget today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTooltip(false);
        }, 20000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Display server error (e.g. rate limit) directly
                throw new Error(data.error || 'Failed to connect');
            }

            if (data.choices && data.choices[0]) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
            }
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: error.message || "Sorry, I'm having trouble connecting right now. Please try again later or contact us on WhatsApp." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Tooltip */}
            {showTooltip && !isOpen && (
                <div className="chatbot-tooltip">
                    Need help? Talk to us
                </div>
            )}

            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
                onClick={() => {
                    setIsOpen(true);
                    setShowTooltip(false);
                }}
                aria-label="Open Chat"
            >
                <Bot size={24} />
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header">
                    <div className="flex items-center gap-xs">
                        <Bot size={20} />
                        <span className="font-bold">Phone Mall Asst.</span>
                    </div>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="chatbot-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about phones, prices..."
                        className="chatbot-input"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </>
    );
}
