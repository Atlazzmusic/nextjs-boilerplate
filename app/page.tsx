'use client';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  async function sendMessage() {
    const userMessage = { sender: 'Du', text: input };
    setMessages([...messages, userMessage]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    const botText = await res.text();
    const botMessage = { sender: 'Bot', text: botText };
    setMessages((prev) => [...prev, botMessage]);
    setInput('');
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>RÅBBIN GPT</h1>
      <div style={{ marginBottom: '1rem' }}>
        {messages.map((msg, idx) => (
          <p key={idx}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Spør meg hva som helst..."
        style={{ padding: '0.5rem', width: '300px' }}
      />
      <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>Send</button>
    </main>
  );
}
