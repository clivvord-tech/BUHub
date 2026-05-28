"use client";
import React, { useEffect, useRef, useState } from "react";
import { getMessages, sendMessage, markAsRead, updateTypingIndicator } from "../../services/messages";
import { supabase } from "../../lib/SupabaseClient";
import Image from "next/image";
import { SpinnerCircularFixed } from "spinners-react";
import { FiPhone, FiVideo, FiMoreHorizontal } from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';
import { AiOutlinePlus } from 'react-icons/ai';

type Props = {
  conversationId: string;
  onMessage?: () => void;
  onClose?: () => void;
};

export default function ChatWindow({ conversationId, onMessage, onClose }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    markAsRead(conversationId);

    // fetch participants + current user
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);
      } catch (e) {}

      try {
        const { data, error } = await supabase
          .from('conversation_participants')
          .select('user:profiles(id, username, name, avatar_url, is_owner)')
          .eq('conversation_id', conversationId);
        if (!error && data) {
          const users = (data || []).map((d: any) => d.user).filter(Boolean);
          setParticipants(users);
        }
      } catch (e) {
        setParticipants([]);
      }
    })();

    // Subscribe to new messages for this conversation
    const channel = supabase
      .channel(`messages:conversation:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages((prev) => {
          // avoid duplicate messages with same id
          try {
            if (!payload?.new?.id) return prev;
            if (prev.some((p: any) => p.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          } catch (e) {
            return prev;
          }
        });
        onMessage?.();
        setTimeout(() => scrollToBottom(), 100);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'typing_indicators', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const newVal = payload.new;
        if (newVal.is_typing) {
          setOtherTyping(newVal.user_id);
        } else {
          setOtherTyping(null);
        }
      })
      .subscribe();

    return () => {
      // unsubscribe
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const res: any = await getMessages(conversationId, 200);
    if (res.error) {
      console.error('Failed to load messages', res.error);
      setMessages([]);
    } else {
      // ensure messages are unique (by id) and preserve order
      const dataArr = res.data || [];
      const seen = new Set<string>();
      const unique: any[] = [];
      for (const m of dataArr) {
        if (!m || !m.id) continue;
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        unique.push(m);
      }
      setMessages(unique);
    }
    setLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const res: any = await sendMessage(conversationId, text.trim());
    if (res.error) {
      alert('Failed to send message');
      return;
    }
    setText("");
    // add sent message only if it's not already present (subscription may also add it)
    if (res.data && res.data.id) {
      setMessages((prev) => {
        if (prev.some((p: any) => p.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
    }
    onMessage?.();
    scrollToBottom();
    // mark as read for sender
    await markAsRead(conversationId);
  };

  const handleTyping = async (value: string) => {
    setText(value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await updateTypingIndicator(conversationId, true);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateTypingIndicator(conversationId, false);
    }, 1500);
  };

  const otherUser = participants.find((p: any) => p.id !== currentUserId);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onClose?.()} className="md:hidden text-secondary-text">Back</button>
          {participants.length <= 2 && otherUser ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-border">
                {otherUser.avatar_url ? (
                  <Image src={otherUser.avatar_url} alt={otherUser.name || otherUser.username} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-border flex items-center justify-center text-secondary-text">{(otherUser.name || otherUser.username)?.[0]}</div>
                )}
              </div>
              <div className="leading-tight">
                <div className="text-white font-semibold">{otherUser.name || otherUser.username}</div>
                <div className="text-secondary-text text-sm">@{otherUser.username}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-white font-semibold">Conversation</div>
              <div className="text-secondary-text text-sm">{participants.length} members</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-hover"><FiPhone /></button>
          <button className="p-2 rounded hover:bg-hover"><FiVideo /></button>
          <button className="p-2 rounded hover:bg-hover"><FiMoreHorizontal /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        {loading ? (
          <div className="flex items-center justify-center"><SpinnerCircularFixed size={20} color="#1DA1F2" /></div>
        ) : messages.length === 0 ? (
          <div className="text-secondary-text">No messages yet</div>
        ) : (
          messages.map((m: any) => {
            if (m.is_system) {
              return (
                <div key={m.id} className="flex justify-center text-secondary-text text-sm">{m.content}</div>
              );
            }

            const isMine = currentUserId ? (m.sender?.id === currentUserId || m.sender_id === currentUserId) : false;

            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image src={m.sender?.avatar_url || '/images/profile.jpg'} alt={m.sender?.username || ''} width={40} height={40} className="object-cover" />
                  </div>
                )}

                <div className={`${isMine ? 'bg-primary text-black' : 'bg-[#0b0b0b] text-white'} max-w-[70%] p-3 rounded-xl ${isMine ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.image_url && (
                    <div className="mt-2 w-48 h-48 rounded overflow-hidden">
                      <Image src={m.image_url} alt="attachment" width={500} height={500} className="object-cover" />
                    </div>
                  )}
                  <div className="text-secondary-text text-xs mt-2 text-right">{new Date(m.created_at).toLocaleString()}</div>
                </div>
              </div>
            );
          })
        )}

        {otherTyping && (
          <div className="text-secondary-text italic">Someone is typing...</div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-hover"><AiOutlinePlus /></button>
          <div className="flex-1">
            <input
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Message"
              className="w-full rounded-full bg-[#0b0b0b] border border-border px-4 py-3 text-white outline-none"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-hover"><BsEmojiSmile /></button>
          <button onClick={handleSend} className="bg-primary text-black px-4 py-2 rounded font-bold">Send</button>
        </div>
      </div>
    </div>
  );
}
