"use client";
import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  conversations: any[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onRefresh?: () => void | Promise<void>;
};

export default function ConversationList({ conversations, selectedConversationId, onSelectConversation }: Props) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-secondary-text">No conversations yet</div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((c) => {
        const other = (c.participants || []).find((p: any) => p.id !== (c.current_user_id || c.currentUserId)) || (c.participants || [])[0];
        const title = other?.name || other?.username || 'Conversation';
        const last = c.last_message;

        return (
          <button
            key={c.id}
            onClick={() => onSelectConversation(c.id)}
            className={`w-full p-3 border-b border-border hover:bg-hover flex items-center gap-3 ${selectedConversationId === c.id ? 'bg-hover' : ''}`}
          >
            <Image src={other?.avatar_url || '/images/profile.jpg'} alt={other?.name || 'User'} width={48} height={48} className="rounded-full" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold truncate">{title}</span>
                </div>
                {last && (
                  <span className="text-xs text-secondary-text">
                    {formatDistanceToNow(new Date(last.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary-text truncate">{last?.content || 'No messages yet'}</p>
                {c.unread_count > 0 && (
                  <span className="ml-2 bg-primary text-black text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{c.unread_count}</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
