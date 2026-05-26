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

  // Fetch original posts by the user
  const { data: originalPosts, error: postsError } = await supabase
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
    .order("created_at", { ascending: false });

  if (postsError) return { error: postsError.message };

  // Fetch reposts by the user
  const { data: reposts, error: repostsError } = await supabase
    .from("reposts")
    .select(`
      created_at,
      user_id,
      posts:tweet_id (
        id,
        content,
        image_url,
        image_path,
        created_at,
        user_id,
        is_pinned,
        profiles:user_id (
          id,
          username,
          name,
          avatar_url,
          is_owner,
          role
        )
      ),
      reposter:user_id (
        id,
        username,
        name,
        avatar_url,
        is_owner
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (repostsError) return { error: repostsError.message };

  // Transform original posts
  const transformedOriginalPosts = originalPosts?.map(post => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
  })) || [];

  // Transform reposts to match Tweet structure
  const transformedReposts = reposts?.map(repost => {
    const post = Array.isArray(repost.posts) ? repost.posts[0] : repost.posts;
    const reposter = Array.isArray(repost.reposter) ? repost.reposter[0] : repost.reposter;
    
    return {
      ...post,
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      reposted_by: reposter,
      repost_created_at: repost.created_at,
    };
  }).filter(post => post.id) || []; // Filter out any null posts

  // Combine and sort by date (original post date for originals, repost date for reposts)
  const allPosts = [
    ...transformedOriginalPosts.map(post => ({
      ...post,
      sort_date: post.created_at
    })),
    ...transformedReposts.map(post => ({
      ...post,
      sort_date: post.repost_created_at || post.created_at
    }))
  ];

  // Sort by date (pinned posts first, then by date)
  allPosts.sort((a, b) => {
    // Pinned posts always come first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Then sort by date
    return new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime();
  });

  // Apply pagination
  const paginatedPosts = allPosts.slice(from, to + 1);

  // Remove sort_date helper field
  const finalPosts = paginatedPosts.map(({ sort_date, ...post }) => post);

  return { data: finalPosts };
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
