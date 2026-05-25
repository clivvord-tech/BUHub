import { supabase } from "../lib/SupabaseClient";

export const followUser = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: followingId });

  if (error) return { error: error.message };
  return { success: true };
};

export const unfollowUser = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);

  if (error) return { error: error.message };
  return { success: true };
};

export const checkIfFollowing = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .single();

  return !!data;
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
