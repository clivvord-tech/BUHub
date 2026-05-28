import { supabase } from "../lib/SupabaseClient";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string | null;
  image_path?: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
  participants: Array<any>;
  last_message?: Message | null;
  unread_count?: number;
};

export const getConversations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Get conversation ids where the user is a participant
    const { data: convParts, error: cpError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations(id, created_at, updated_at)')
      .eq('user_id', user.id);

    if (cpError) return { error: cpError.message };

    // Sort by the joined conversation updated_at on the client side
    const convPartsData = (convParts || []).slice();
    convPartsData.sort((a: any, b: any) => {
      const ad = a?.conversations?.updated_at ? new Date(a.conversations.updated_at).getTime() : 0;
      const bd = b?.conversations?.updated_at ? new Date(b.conversations.updated_at).getTime() : 0;
      return bd - ad;
    });

    const conversationIds = convPartsData.map((c: any) => c.conversation_id) || [];
    if (conversationIds.length === 0) return { data: [] };

    // Fetch latest messages for these conversations
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, image_url, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    if (msgError) return { error: msgError.message };

    const lastMessageMap: Record<string, Message> = {};
    (messages || []).forEach((m: any) => {
      if (!lastMessageMap[m.conversation_id]) lastMessageMap[m.conversation_id] = m;
    });

    // Fetch participants + profile info
    const { data: parts, error: partsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at, user:profiles(id, username, name, avatar_url, is_owner)')
      .in('conversation_id', conversationIds);

    if (partsError) return { error: partsError.message };

    const participantsByConv: Record<string, any[]> = {};
    (parts || []).forEach((p: any) => {
      participantsByConv[p.conversation_id] = participantsByConv[p.conversation_id] || [];
      participantsByConv[p.conversation_id].push({ ...p.user, last_read_at: p.last_read_at });
    });

    // Compute unread counts per conversation for current user
    const unreadMap: Record<string, number> = {};
    for (const cid of conversationIds) {
      const participants = participantsByConv[cid] || [];
      const me = participants.find((x: any) => x.id === user.id);
      const lastRead = me?.last_read_at ? new Date(me.last_read_at) : new Date(0);
      const convMessages = (messages || []).filter((m: any) => m.conversation_id === cid);
      const unreadCount = convMessages.filter((m: any) => new Date(m.created_at) > lastRead).length;
      unreadMap[cid] = unreadCount;
    }

    const conversations: Conversation[] = (convPartsData || []).map((cp: any) => ({
      id: cp.conversation_id,
      created_at: cp.conversations.created_at,
      updated_at: cp.conversations.updated_at,
      participants: participantsByConv[cp.conversation_id] || [],
      last_message: lastMessageMap[cp.conversation_id] || null,
      unread_count: unreadMap[cp.conversation_id] || 0,
    }));

    return { data: conversations };
  } catch (err: any) {
    console.error('[getConversations] Exception:', err);
    return { error: 'Failed to fetch conversations' };
  }
};

export const getMessages = async (conversationId: string, limit = 100) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, image_url, image_path, created_at, sender:profiles(id, username, name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    console.error('[getMessages] Exception:', err);
    return { error: 'Failed to fetch messages' };
  }
};

export const sendMessage = async (conversationId: string, content: string, imagePath?: string, imageUrl?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const payload: any = {
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    };

    if (imagePath) payload.image_path = imagePath;
    if (imageUrl) payload.image_url = imageUrl;

    const { data, error } = await supabase.from('messages').insert(payload).select();
    if (error) {
      console.error('[sendMessage] Insert error:', error);
      return { error: error.message };
    }

    return { data: data?.[0] };
  } catch (err: any) {
    console.error('[sendMessage] Exception:', err);
    return { error: 'Failed to send message' };
  }
};

export const markAsRead = async (conversationId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    console.error('[markAsRead] Exception:', err);
    return { error: 'Failed to mark as read' };
  }
};

export const startConversation = async (otherUserId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Call DB helper function that finds or creates a 1:1 conversation
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      participant1_id: user.id,
      participant2_id: otherUserId,
    });

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    console.error('[startConversation] Exception:', err);
    return { error: 'Failed to start conversation' };
  }
};

export const searchUsers = async (query: string, limit = 10) => {
  try {
    const q = query.trim();
    if (!q) return { data: [] };

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, avatar_url, is_owner')
      .ilike('username', `%${q}%`)
      .limit(limit);

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    console.error('[searchUsers] Exception:', err);
    return { error: 'Failed to search users' };
  }
};

export const updateTypingIndicator = async (conversationId: string, isTyping: boolean) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const payload = {
      conversation_id: conversationId,
      user_id: user.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('typing_indicators')
      .upsert(payload, { onConflict: 'conversation_id,user_id' })
      .select();

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    console.error('[updateTypingIndicator] Exception:', err);
    return { error: 'Failed to update typing indicator' };
  }
};
