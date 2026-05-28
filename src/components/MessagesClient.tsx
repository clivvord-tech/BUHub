"use client";
import React, { useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import NewMessageModal from "./NewMessageModal";
import { getConversations } from "../../services/messages";
import { BiMessageSquareDetail } from 'react-icons/bi';

export default function MessagesClient() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
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

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Conversation list column */}
      <div className="w-full md:w-96 border-r border-border bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Messages</h2>
          <button onClick={() => setShowNewMessage(true)} className="text-primary font-bold">New</button>
        </div>
        <div className="flex-1 h-[calc(100vh-112px)] overflow-y-auto">
          <ConversationList
            conversations={conversations}
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
