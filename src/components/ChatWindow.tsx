"use client";
import React, { useEffect, useRef, useState } from "react";
import { getMessages, sendMessage, markAsRead, updateTypingIndicator } from "../../services/messages";
import { supabase } from "../../lib/SupabaseClient";
import Image from "next/image";
import { SpinnerCircularFixed } from "spinners-react";

type Props = {
  conversationId: string;
  onMessage?: () => void;
  onClose?: () => void;
};

export default function ChatWindow({ conversationId, onMessage, onClose }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    markAsRead(conversationId);

    // Subscribe to new messages for this conversation
    const channel = supabase
      .channel(`messages:conversation:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
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
      setMessages(res.data || []);
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
    setMessages((prev) => [...prev, res.data]);
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

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onClose?.()} className="md:hidden text-secondary-text">Back</button>
          <h3 className="text-white font-bold">Conversation</h3>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        {loading ? (
          <div className="flex items-center justify-center"><SpinnerCircularFixed size={20} color="#1DA1F2" /></div>
        ) : messages.length === 0 ? (
          <div className="text-secondary-text">No messages yet</div>
        ) : (
          messages.map((m: any) => (
            <div key={m.id} className={`flex items-start gap-3 ${m.is_system ? 'justify-center' : ''}`}>
              <div className="flex-1">
                <div className="text-secondary-text text-xs">{m.sender?.username || m.sender_id}</div>
                <div className="text-white">{m.content}</div>
                {m.image_url && (
                  <div className="mt-2 w-48 h-48 rounded overflow-hidden">
                    <Image src={m.image_url} alt="attachment" width={500} height={500} className="object-cover" />
                  </div>
                )}
                <div className="text-secondary-text text-xs mt-1">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
        {otherTyping && (
          <div className="text-secondary-text italic">Someone is typing...</div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 p-2 rounded bg-background border border-border text-white outline-none"
          />
          <button onClick={handleSend} className="bg-primary text-black px-4 py-2 rounded font-bold">Send</button>
        </div>
      </div>
    </div>
  );
}
