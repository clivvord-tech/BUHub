import { supabase } from "../lib/SupabaseClient";

export const addRepost = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reposts")
    .insert({ user_id: user.id, tweet_id: tweetId });

  if (error) return { error: error.message };
  return { success: true };
};

export const removeRepost = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reposts")
    .delete()
    .eq("user_id", user.id)
    .eq("tweet_id", tweetId);

  if (error) return { error: error.message };
  return { success: true };
};

export const checkIfReposted = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("reposts")
    .select("id")
    .eq("user_id", user.id)
    .eq("tweet_id", tweetId)
    .single();

  return !!data;
};

export const getRepostCount = async (tweetId: string) => {
  const { count } = await supabase
    .from("reposts")
    .select("*", { count: "exact", head: true })
    .eq("tweet_id", tweetId);

  return count || 0;
};

export const pinPost = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Unpin all other posts first
  await supabase
    .from("posts")
    .update({ is_pinned: false })
    .eq("user_id", user.id);

  // Pin this post
  const { error } = await supabase
    .from("posts")
    .update({ is_pinned: true })
    .eq("id", tweetId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
};

export const unpinPost = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("posts")
    .update({ is_pinned: false })
    .eq("id", tweetId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
};
