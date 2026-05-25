import { supabase } from "../lib/SupabaseClient";

export const addBookmark = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, tweet_id: tweetId });

  if (error) return { error: error.message };
  return { success: true };
};

export const removeBookmark = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("tweet_id", tweetId);

  if (error) return { error: error.message };
  return { success: true };
};

export const checkIfBookmarked = async (tweetId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("tweet_id", tweetId)
    .single();

  return !!data;
};

export const getBookmarks = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      tweet_id,
      posts(
        id,
        content,
        image_url,
        created_at,
        profiles(
          id,
          username,
          name,
          avatar_url,
          is_owner
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
};
