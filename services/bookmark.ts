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
      posts!bookmarks_tweet_id_fkey(
        id,
        content,
        image_url,
        image_path,
        created_at,
        is_pinned,
        profiles!posts_user_id_fkey(
          id,
          username,
          name,
          avatar_url,
          is_owner,
          role
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  
  // Transform nested data - posts and profiles come as arrays
  const transformedData = data?.map(bookmark => {
    const post = Array.isArray(bookmark.posts) ? bookmark.posts[0] : bookmark.posts;
    if (!post) return { ...bookmark, posts: null };
    
    return {
      ...bookmark,
      posts: {
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }
    };
  });
  
  return { data: transformedData };
};
