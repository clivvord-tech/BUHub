"use client";
import React, { useEffect, useState } from 'react';
import { searchUsers, startConversation } from '../../services/messages';

type Props = {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
};

export default function NewMessageModal({ onClose, onCreated }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length === 0) return setResults([]);
      doSearch(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const doSearch = async (q: string) => {
    setLoading(true);
    const res: any = await searchUsers(q, 10);
    if (res.error) {
      console.error(res.error);
      setResults([]);
    } else {
      setResults(res.data || []);
    }
    setLoading(false);
  };

  const handleStart = async (userId: string) => {
    const res: any = await startConversation(userId);
    if (res.error) {
      alert('Failed to start conversation');
      return;
    }
    const convoId = res.data;
    onCreated(convoId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-background rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">New Message</h3>
          <button onClick={onClose} className="text-secondary-text">Close</button>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" className="w-full p-2 rounded bg-border text-white mb-2" />
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="text-secondary-text p-2">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-secondary-text p-2">No results</div>
          ) : (
            results.map((r) => (
              <div key={r.id} className="p-2 hover:bg-hover cursor-pointer flex items-center justify-between" onClick={() => handleStart(r.id)}>
                <div>
                  <div className="font-bold text-white">{r.name}</div>
                  <div className="text-secondary-text text-sm">@{r.username}</div>
                </div>
                <button className="bg-white text-black px-3 py-1 rounded">Message</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
