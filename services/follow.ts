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
