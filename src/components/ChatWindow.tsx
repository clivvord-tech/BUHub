'use client';

import { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, markAsRead, updateTypingIndicator, type Message } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { FiArrowLeft, FiSend, FiImage } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
  onMessageSent: () => void;
}

export default function ChatWindow({ conversationId, onBack, onMessageSent }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    markAsRead(conversationId);
    subscribeToMessages();
    subscribeToTyping();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      
      if (data.length > 0) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const firstMessage = data[0];
        const otherUserId = firstMessage.sender_id === user?.id 
          ? data.find(m => m.sender_id !== user?.id)?.sender_id 
          : firstMessage.sender_id;
        
        if (otherUserId) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();
          setOtherUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = async () => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(`
              id, conversation_id, sender_id, content, image_url, image_path, created_at,
              sender:profiles!sender_id(id, username, name, avatar_url, is_owner)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setMessages(prev => [...prev, data as Message]);
            markAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'typing_indicators', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          if (payload.new && payload.new.user_id !== user?.id) {
            setIsTyping(payload.new.is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTyping = () => {
    updateTypingIndicator(conversationId, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingIndicator(conversationId, false);
    }, 2000);
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, newMessage, imageFile || undefined);
      setNewMessage('');
      setImageFile(null);
      setImagePreview(null);
      updateTypingIndicator(conversationId, false);
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-800 rounded-full">
          <FiArrowLeft size={20} />
        </button>
        {otherUser && (
          <>
            <Image
              src={otherUser.avatar_url || '/images/profile.jpg'}
              alt={otherUser.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{otherUser.name}</span>
                {otherUser.is_owner && <span className="text-yellow-500">★</span>}
              </div>
              <span className="text-sm text-gray-500">@{otherUser.username}</span>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === otherUser?.id ? false : true;

          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isOwn ? 'bg-blue-600' : 'bg-gray-800'} rounded-2xl px-4 py-2`}>
                {message.image_url && (
                  <Image
                    src={message.image_url}
                    alt="Message image"
                    width={300}
                    height={300}
                    className="rounded-lg mb-2"
                  />
                )}
                <p className="break-words">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2">
              <span className="text-gray-400">typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <Image src={imagePreview} alt="Preview" width={100} height={100} className="rounded" />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <FiImage size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 rounded-full px-4 py-2 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!newMessage.trim() && !imageFile)}
            className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
