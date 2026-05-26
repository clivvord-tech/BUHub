'use client';

import { useState, useEffect } from 'react';
import { getConversations, type Conversation } from '@/services/messages';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewMessageModal from './NewMessageModal';
import { FiEdit } from 'react-icons/fi';

export default function MessagesClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationCreated = (conversationId: string) => {
    setShowNewMessage(false);
    setSelectedConversationId(conversationId);
    loadConversations();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <>
      <div className="flex h-screen border-x border-gray-800">
        {/* Conversation List - Hidden on mobile when chat is open */}
        <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-gray-800 flex-col`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold">Messages</h1>
            <button
              onClick={() => setShowNewMessage(true)}
              className="p-2 hover:bg-gray-800 rounded-full transition"
            >
              <FiEdit size={20} />
            </button>
          </div>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

        {/* Chat Window - Full width on mobile, fixed width on desktop */}
        <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1`}>
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
              onMessageSent={loadConversations}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Select a message</h2>
                <p>Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </>
  );
}
