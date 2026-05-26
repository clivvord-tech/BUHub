import { supabase } from "../lib/SupabaseClient";

export interface PostAnalytics {
  postId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export const getPostAnalytics = async (postId: string): Promise<PostAnalytics | null> => {
  // Get post with view count
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, view_count, created_at")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    console.error("Error fetching post:", postError);
    return null;
  }

  // Get like count
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("tweet_id", postId);

  // Get comment count
  const { count: commentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("tweet_id", postId);

  return {
    postId: post.id,
    viewCount: post.view_count || 0,
    likeCount: likeCount || 0,
    commentCount: commentCount || 0,
    createdAt: post.created_at,
  };
};
