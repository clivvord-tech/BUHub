"use client";
import React, { useEffect, useRef, useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import NewMessageModal from "./NewMessageModal";
import { getConversations, markAllAsRead } from "../../services/messages";
import { BiMessageSquareDetail } from 'react-icons/bi';
import { FiChevronDown, FiInbox, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function MessagesClient() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<'all'|'unread'|'direct'|'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res: any = await getConversations();
      if (res.error) {
        console.error('Failed to load conversations', res.error);
        setConversations([]);
      } else {
        setConversations(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleConversationCreated = (conversationId: string) => {
    setShowNewMessage(false);
    setSelectedConversationId(conversationId);
    loadConversations();
  };

  const handleMarkAllRead = async () => {
    const res: any = await markAllAsRead();
    if (res.error) {
      console.error(res.error);
    } else {
      await loadConversations();
      setFilterOpen(false);
    }
  };

  // filter conversations client-side by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const other = (c.participants || []).find((p: any) => true);
    const name = (other?.name || other?.username || '').toLowerCase();
    const last = (c.last_message?.content || '').toLowerCase();
    return name.includes(q) || last.includes(q);
  });

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Conversation list column */}
      <div className="w-full md:w-96 border-r border-border bg-background flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">Chat</h2>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button onClick={() => setFilterOpen((s) => !s)} className="flex items-center gap-2 bg-[#0b0b0b] px-3 py-2 rounded-full border border-border">
                <span className="text-secondary-text">{filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                <FiChevronDown className="text-secondary-text" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                  <button onClick={() => { setFilter('all'); setFilterOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-hover">All</button>
                  <button onClick={() => { setFilter('unread'); setFilterOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-hover">Unread</button>
                  <button onClick={() => { setFilter('direct'); setFilterOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-hover">Direct</button>
                  <button onClick={() => { setFilter('groups'); setFilterOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-hover">Groups</button>
                  <div className="border-t border-border" />
                  <button onClick={() => router.push('/home/settings')} className="w-full text-left px-4 py-3 hover:bg-hover">Settings</button>
                  <button onClick={handleMarkAllRead} className="w-full text-left px-4 py-3 hover:bg-hover">Mark all as read</button>
                </div>
              )}
            </div>

            <button onClick={() => setShowNewMessage(true)} className="bg-primary p-2 rounded-full text-black"><FiPlus /></button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center text-secondary-text">🔍</div>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className="w-full pl-12 pr-4 py-3 rounded-full bg-[#0b0b0b] border border-border text-white outline-none" />
          </div>
        </div>

        <div className="flex-1 h-[calc(100vh-168px)] overflow-y-auto">
          <ConversationList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelect}
            onRefresh={loadConversations}
          />
        </div>
      </div>

      {/* Main chat area / empty state */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <div className="flex-1">
            <ChatWindow
              conversationId={selectedConversationId}
              onMessage={() => loadConversations()}
              onClose={() => setSelectedConversationId(null)}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center px-6">
              <div className="mx-auto mb-6 w-28 h-28 rounded-full bg-[#0b0b0b] border border-border flex items-center justify-center">
                <BiMessageSquareDetail className="text-secondary-text" size={48} />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Start Conversation</h2>
              <p className="text-secondary-text mb-6">Choose from your existing conversations, or start a new one.</p>
              <button onClick={() => setShowNewMessage(true)} className="bg-white text-black px-4 py-2 rounded-full font-semibold">New chat</button>
            </div>
          </div>
        )}
      </div>

      {showNewMessage && (
        <NewMessageModal onClose={() => setShowNewMessage(false)} onCreated={handleConversationCreated} />
      )}
    </div>
  );
}
