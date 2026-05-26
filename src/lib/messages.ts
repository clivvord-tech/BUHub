'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  sender: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
    is_owner: boolean;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: Array<{
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
    is_owner: boolean;
  }>;
  last_message: Message | null;
  unread_count: number;
}

// Get all conversations for current user
export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  // Get conversations with participants
  const { data: convos, error } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      conversations!inner(id, created_at, updated_at)
    `)
    .eq('user_id', user.id);

  if (error) throw error;

  const conversations: Conversation[] = [];

  for (const convo of convos || []) {
    const conversationId = convo.conversations.id;

    // Get all participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id, profiles!inner(id, username, name, avatar_url, is_owner)')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id);

    // Get last message
    const { data: lastMessage } = await supabase
      .from('messages')
      .select(`
        id, conversation_id, sender_id, content, image_url, image_path, created_at,
        sender:profiles!sender_id(id, username, name, avatar_url, is_owner)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get unread count
    const { data: participantData } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .gt('created_at', participantData?.last_read_at || new Date(0).toISOString());

    conversations.push({
      id: conversationId,
      created_at: convo.conversations.created_at,
      updated_at: convo.conversations.updated_at,
      participants: participants?.map(p => p.profiles) || [],
      last_message: lastMessage as Message | null,
      unread_count: unreadCount || 0,
    });
  }

  return conversations.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, conversation_id, sender_id, content, image_url, image_path, created_at,
      sender:profiles!sender_id(id, username, name, avatar_url, is_owner)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data as Message[];
}

// Send a message
export async function sendMessage(conversationId: string, content: string, imageFile?: File) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  let imageUrl = null;
  let imagePath = null;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('messages')
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('messages')
      .getPublicUrl(fileName);

    imageUrl = publicUrl;
    imagePath = fileName;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      image_url: imageUrl,
      image_path: imagePath,
    })
    .select(`
      id, conversation_id, sender_id, content, image_url, image_path, created_at,
      sender:profiles!sender_id(id, username, name, avatar_url, is_owner)
    `)
    .single();

  if (error) throw error;

  revalidatePath('/home/messages');
  return data as Message;
}

// Mark conversation as read
export async function markAsRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/home/messages');
}

// Start a new conversation
export async function startConversation(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    participant1_id: user.id,
    participant2_id: otherUserId,
  });

  if (error) throw error;

  revalidatePath('/home/messages');
  return data as string;
}

// Search users for new conversation
export async function searchUsers(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url, is_owner')
    .neq('id', user.id)
    .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;

  return data;
}

// Update typing indicator
export async function updateTypingIndicator(conversationId: string, isTyping: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('typing_indicators')
    .upsert({
      conversation_id: conversationId,
      user_id: user.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}
