"use client";
import React, { useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import NewMessageModal from "./NewMessageModal";
import { getConversations } from "../../services/messages";

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
    <div className="flex h-screen">
      <div className="w-full md:w-96 border-r border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Messages</h2>
          <button onClick={() => setShowNewMessage(true)} className="text-primary font-bold">New</button>
        </div>
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelect}
            onRefresh={loadConversations}
          />
        </div>
      </div>

      <div className="flex-1">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onMessage={() => loadConversations()}
            onClose={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-secondary-text">Select a conversation or start a new one</p>
          </div>
        )}
      </div>

      {showNewMessage && (
        <NewMessageModal onClose={() => setShowNewMessage(false)} onCreated={handleConversationCreated} />
      )}
    </div>
  );
}
