"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/SupabaseClient';

type Props = {
  conversations: any[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onRefresh?: () => void | Promise<void>;
};

export default function ConversationList({ conversations, selectedConversationId, onSelectConversation }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);
      } catch (e) {
        setCurrentUserId(null);
      }
    })();
  }, []);

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-secondary-text">No conversations yet</div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((c) => {
        const other = (c.participants || []).find((p: any) => p.id !== currentUserId) || (c.participants || [])[0];
        const title = other?.name || other?.username || 'Conversation';
        const last = c.last_message;

        const formatPreview = (msg: any) => {
          if (!msg) return 'No messages yet';
          const hasImage = msg.image_url;
          const content = (msg.content || '').trim();
          let preview = '';
          if (hasImage && !content) preview = 'Sent a photo';
          else preview = content || 'Sent a message';
          if (msg.sender_id === currentUserId) return `You: ${preview}`;
          return preview;
        };

        const previewText = formatPreview(last);

        const timeAgoShort = (d: string) => {
          if (!d) return '';
          try {
            const diff = Date.now() - new Date(d).getTime();
            const s = Math.floor(diff / 1000);
            if (s < 60) return 'now';
            const m = Math.floor(s / 60);
            if (m < 60) return `${m}m`;
            const h = Math.floor(m / 60);
            if (h < 24) return `${h}h`;
            const day = Math.floor(h / 24);
            if (day < 7) return `${day}d`;
            const w = Math.floor(day / 7);
            if (w < 4) return `${w}w`;
            const mo = Math.floor(day / 30);
            if (mo < 12) return `${mo}mo`;
            const y = Math.floor(day / 365);
            return `${y}y`;
          } catch (e) { return ''; }
        };

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
                    {timeAgoShort(last.created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary-text truncate">{previewText}</p>
                {c.unread_count > 0 && (
                  <span className={`ml-2 ${c.unread_count === 1 ? 'w-3 h-3 rounded-full' : 'bg-primary text-black text-xs rounded-full px-2 py-0.5 min-w-[20px]' } flex items-center justify-center` } style={{background: c.unread_count === 1 ? undefined : ''}}>
                    {c.unread_count === 1 ? <span className="block w-3 h-3 bg-primary rounded-full"/> : c.unread_count}
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
