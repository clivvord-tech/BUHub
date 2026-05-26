import { supabase } from "../lib/SupabaseClient";

export const followUser = async (followingId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Insert directly - let the UNIQUE constraint handle duplicates
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: followingId });

    if (error) {
      // Check if it's a duplicate error (UNIQUE constraint violation)
      if (error.code === '23505') {
        console.log("Already following - this is expected");
        return { success: true }; // Treat as success
      }
      console.error("Follow error:", error);
      return { error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error("Follow exception:", err);
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
    if (!user) return false;

    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .maybeSingle();

    if (error) {
      console.error("Check following error:", error);
      return false;
    }

    const isFollowing = !!data;
    console.log(`Checking if following ${followingId}:`, isFollowing);
    return isFollowing;
  } catch (err) {
    console.error("Check following exception:", err);
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
