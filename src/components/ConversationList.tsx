'use client';

import { type Conversation } from '@/lib/messages';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => {
        const otherUser = conversation.participants[0];
        const isSelected = conversation.id === selectedId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`w-full p-4 border-b border-gray-800 hover:bg-gray-900 transition flex items-start gap-3 ${
              isSelected ? 'bg-gray-900' : ''
            }`}
          >
            <Image
              src={otherUser?.avatar_url || '/images/profile.jpg'}
              alt={otherUser?.name || 'User'}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold truncate">{otherUser?.name}</span>
                  {otherUser?.is_owner && <span className="text-yellow-500">★</span>}
                </div>
                {conversation.last_message && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate">
                  {conversation.last_message?.content || 'No messages yet'}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
