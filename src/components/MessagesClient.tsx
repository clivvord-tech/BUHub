'use client';

import { useState, useEffect } from 'react';
import { getConversations, type Conversation } from '@/lib/messages';
import ConversationList from '@/components/ConversationList';
import ChatWindow from '@/components/ChatWindow';
import NewMessageModal from '@/components/NewMessageModal';
import { FiEdit } from 'react-icons/fi';

interface MessagesClientProps {
  userId: string;
}

export default function MessagesClient({ userId }: MessagesClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations. Please try again.');
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
    return (
      <div className="flex h-screen border-x border-gray-800">
        <div className="w-full md:w-96 border-r border-gray-800 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading conversations...</div>
          </div>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen border-x border-gray-800 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
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

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
