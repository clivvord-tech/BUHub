import { supabase } from "../lib/SupabaseClient";

export const getUserProfile = async (username: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      name,
      avatar_url,
      bio,
      is_owner,
      role,
      created_at
    `)
    .eq("username", username)
    .single();

  if (error) return { error: error.message };

  // Get stats
  const [followersCount, followingCount, postsCount] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", data.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", data.id),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", data.id),
  ]);

  return {
    data: {
      ...data,
      followers_count: followersCount.count || 0,
      following_count: followingCount.count || 0,
      posts_count: postsCount.count || 0,
    },
  };
};

export const getUserPosts = async (userId: string, page = 0, pageSize = 10) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      image_url,
      image_path,
      created_at,
      user_id,
      is_pinned,
      profiles!posts_user_id_fkey(
        id,
        username,
        name,
        avatar_url,
        is_owner,
        role
      )
    `)
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { error: error.message };
  
  // Transform profiles from array to single object
  const transformedData = data?.map(post => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
  }));
  
  return { data: transformedData };
};

export const updateUserProfile = async (updates: {
  name?: string;
  bio?: string;
  avatar_url?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
};
