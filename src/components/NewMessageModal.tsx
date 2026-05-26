'use client';

import { useState } from 'react';
import { searchUsers, startConversation } from '@/services/messages';
import Image from 'next/image';
import { FiX, FiSearch } from 'react-icons/fi';

interface NewMessageModalProps {
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export default function NewMessageModal({ onClose, onConversationCreated }: NewMessageModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const conversationId = await startConversation(userId);
      onConversationCreated(conversationId);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">New Message</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
            <FiX size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500">Searching...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500 text-center">
                {query.trim().length < 2 ? 'Type to search users' : 'No users found'}
              </div>
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full p-4 hover:bg-gray-800 transition flex items-center gap-3"
                >
                  <Image
                    src={user.avatar_url || '/images/profile.jpg'}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{user.name}</span>
                      {user.is_owner && <span className="text-yellow-500">★</span>}
                    </div>
                    <span className="text-sm text-gray-500">@{user.username}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
