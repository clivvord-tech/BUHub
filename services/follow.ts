import { supabase } from "../lib/SupabaseClient";

export const followUser = async (followingId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[followUser] Current user:', user?.id);
    console.log('[followUser] Following:', followingId);
    
    if (!user) return { error: "Not authenticated" };

    // Insert directly - let the UNIQUE constraint handle duplicates
    const { data, error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: followingId })
      .select();

    if (error) {
      // Check if it's a duplicate error (UNIQUE constraint violation)
      if (error.code === '23505') {
        console.log("[followUser] Already following - treating as success");
        return { success: true }; // Treat as success
      }
      console.error("[followUser] Insert error:", error);
      return { error: error.message };
    }
    
    console.log('[followUser] Successfully inserted:', data);
    return { success: true };
  } catch (err) {
    console.error("[followUser] Exception:", err);
    return { error: "Failed to follow user" };
  }
};

export const unfollowUser = async (followingId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", followingId);

    if (error) {
      console.error("Unfollow error:", error);
      return { error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error("Unfollow exception:", err);
    return { error: "Failed to unfollow user" };
  }
};

export const checkIfFollowing = async (followingId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[checkIfFollowing] Current user:', user?.id);
    console.log('[checkIfFollowing] Checking if following:', followingId);
    
    if (!user) {
      console.log('[checkIfFollowing] No user, returning false');
      return false;
    }

    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .maybeSingle();

    if (error) {
      console.error("[checkIfFollowing] Query error:", error);
      return false;
    }

    const isFollowing = !!data;
    console.log(`[checkIfFollowing] Result - Following ${followingId}:`, isFollowing);
    console.log('[checkIfFollowing] Data returned:', data);
    return isFollowing;
  } catch (err) {
    console.error("[checkIfFollowing] Exception:", err);
    return false;
  }
};

export const getFollowStatus = async (targetUserId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isFollowing: false, isFollowedBy: false };

    const { data, error } = await supabase
      .from("follows")
      .select("follower_id, following_id")
      .or(`and(follower_id.eq.${user.id},following_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},following_id.eq.${user.id})`);

    if (error) {
      console.error("[getFollowStatus] Error:", error);
      return { isFollowing: false, isFollowedBy: false };
    }

    const isFollowing = data?.some(f => f.follower_id === user.id && f.following_id === targetUserId) || false;
    const isFollowedBy = data?.some(f => f.follower_id === targetUserId && f.following_id === user.id) || false;

    return { isFollowing, isFollowedBy };
  } catch (err) {
    console.error("[getFollowStatus] Exception:", err);
    return { isFollowing: false, isFollowedBy: false };
  }
};

// Batched follow status: given an array of target user ids, return a map of statuses.
export const getFollowStatuses = async (targetUserIds: string[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const currentUserId = user.id;

    // Query which targets the current user is following
    const { data: followingData, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId)
      .in('following_id', targetUserIds);

    if (followingError) {
      console.error('[getFollowStatuses] following query error:', followingError);
      return {};
    }

    // Query which targets follow the current user
    const { data: followedByData, error: followedByError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', currentUserId)
      .in('follower_id', targetUserIds);

    if (followedByError) {
      console.error('[getFollowStatuses] followedBy query error:', followedByError);
      return {};
    }

    const followingSet = new Set((followingData || []).map((r: any) => r.following_id));
    const followedBySet = new Set((followedByData || []).map((r: any) => r.follower_id));

    const result: Record<string, { isFollowing: boolean; isFollowedBy: boolean }> = {};
    for (const id of targetUserIds) {
      result[id] = {
        isFollowing: followingSet.has(id),
        isFollowedBy: followedBySet.has(id),
      };
    }

    return result;
  } catch (err) {
    console.error('[getFollowStatuses] Exception:', err);
    return {};
  }
};

export const getFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      id,
      created_at,
      follower:profiles!follows_follower_id_fkey(
        id,
        username,
        name,
        avatar_url,
        is_owner
      )
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
};

export const getFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      id,
      created_at,
      following:profiles!follows_following_id_fkey(
        id,
        username,
        name,
        avatar_url,
        is_owner
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
};
