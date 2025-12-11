"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

type Msg = { _id?: string; senderName: string; message: string; createdAt?: string };

export default function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const { user, token } = useAuth();
  const latestRef = useRef<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const fetchMessages = async () => {
    try {
      const since = latestRef.current ? `?since=${encodeURIComponent(latestRef.current)}` : '';
      const resp = await fetch(`/api/chat/messages${since}`);
      const data = await resp.json();
      if (data?.messages?.length) {
        setMessages(prev => [...prev, ...data.messages]);
        latestRef.current = data.messages[data.messages.length - 1].createdAt;
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // initial load
    (async () => {
      try {
        const resp = await fetch('/api/chat/messages');
        const data = await resp.json();
        setMessages(data.messages || []);
        if (data.messages && data.messages.length) latestRef.current = data.messages[data.messages.length - 1].createdAt;
      } catch (e) {}
    })();

    pollingRef.current = window.setInterval(fetchMessages, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const send = async () => {
    if (!text.trim()) return;
    const payload = { senderName: user?.name || user?.email || 'Khách', message: text.trim(), userId: user?._id };
    try {
      const resp = await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify(payload) });
      const data = await resp.json();
      if (data?.message) {
        setMessages(prev => [...prev, data.message]);
        latestRef.current = data.message.createdAt;
        setText('');
      }
    } catch (e) {
      console.error('send chat error', e);
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white max-w-md">
      <div className="h-64 overflow-auto mb-3" style={{ background: '#f9fafb' }}>
        {messages.map((m, i) => (
          <div key={m._id || i} className="p-2 border-b">
            <div className="text-xs text-gray-500">{m.senderName} • {new Date(m.createdAt || Date.now()).toLocaleTimeString()}</div>
            <div className="text-sm">{m.message}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-2 border rounded" value={text} onChange={e => setText(e.target.value)} placeholder="Gửi tin nhắn..." />
        <button onClick={send} className="bg-blue-600 text-white px-3 rounded">Gửi</button>
      </div>
    </div>
  );
}
