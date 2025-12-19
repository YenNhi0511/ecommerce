"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminWebhooks() {
  const [events, setEvents] = useState<any[]>([]);
  const { token } = useAuth();

  const load = async () => {
    try {
      const resp = await fetch('/api/webhooks/events', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      const data = await resp.json();
      setEvents(data.events || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const retry = async (id: string) => {
    try {
      await fetch(`/api/webhooks/events/${id}/process`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      load();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Webhook events</h2>
      <div className="space-y-3">
        {events.map(ev => (
          <div key={ev._id} className="p-3 border rounded bg-white">
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium">{ev.type} <span className="text-xs text-black">{ev.provider}</span></div>
                <div className="text-xs text-black">{new Date(ev.receivedAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${ev.processed ? 'text-green-600' : 'text-red-600'}`}>{ev.processed ? 'Processed' : 'Pending'}</div>
                <button onClick={() => retry(ev._id)} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">Retry</button>
              </div>
            </div>
            {ev.error && <div className="text-xs text-red-600 mt-2">Error: {ev.error}</div>}
            <details className="mt-2 text-xs"><summary className="cursor-pointer">Raw</summary><pre className="whitespace-pre-wrap">{ev.raw}</pre></details>
            {ev.provider === 'momo' && (() => {
              try {
                const parsed = JSON.parse(ev.raw || '{}');
                const payUrl = parsed.payUrl || parsed.redirectUrl || parsed.checkoutUrl || parsed.payUrl;
                if (payUrl) return <div className="mt-2"><a target="_blank" rel="noreferrer" href={payUrl} className="text-sm text-blue-600 underline">Open MoMo payUrl</a></div>;
              } catch (e) { }
              return null;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
