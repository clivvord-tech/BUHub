"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { searchUsers, startConversation, getConversations } from '../../services/messages';
import { BsPeople } from 'react-icons/bs';
import OwnerBadge from './OwnerBadge';

type Props = {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
};

export default function NewMessageModal({ onClose, onCreated }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecent();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = query.trim();
      if (q.length === 0) return setResults([]);
      doSearch(q);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const loadRecent = async () => {
    try {
      const res: any = await getConversations();
      if (res.error) return setRecent([]);
      const users: any[] = [];
      (res.data || []).forEach((conv: any) => {
        (conv.participants || []).forEach((p: any) => {
          if (!p) return;
          if (!users.find(u => u.id === p.id)) users.push(p);
        });
      });
      setRecent(users.slice(0, 10));
    } catch (e) {
      setRecent([]);
    }
  };

  const doSearch = async (q: string) => {
    setLoading(true);
    const res: any = await searchUsers(q, 20);
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

  const items = query.trim() ? results : recent;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-24">
      <div className="w-full max-w-2xl bg-background rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-white mx-auto">New message</h3>
          <button onClick={onClose} className="text-secondary-text absolute right-6 top-5">Close</button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-secondary-text">🔍</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or username"
                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#0b0b0b] border border-border text-white outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <button className="flex items-center gap-2 text-primary font-medium">
              <BsPeople />
              <span>Create a group</span>
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-secondary-text p-2">Searching...</div>
            ) : items.length === 0 ? (
              <div className="text-secondary-text p-2">No results</div>
            ) : (
              items.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => handleStart(r.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-hover text-left"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-border flex-shrink-0">
                    {r.avatar_url ? (
                      <Image src={r.avatar_url} alt={r.name || r.username} width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-border flex items-center justify-center text-secondary-text">{r.name?.[0] || '@'}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{r.name || r.username}</span>
                      <OwnerBadge isOwner={r.is_owner} size="sm" />
                    </div>
                    <div className="text-secondary-text text-sm truncate">@{r.username}</div>
                  </div>
                  <div className="text-secondary-text text-sm">Message</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
