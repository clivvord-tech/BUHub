import { supabase } from "../lib/SupabaseClient";

export const trackPostView = async (postId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Call the increment function
  const { error } = await supabase.rpc('increment_post_view', {
    p_post_id: postId,
    p_user_id: user?.id || null,
    p_ip: null
  });

  if (error) console.error("View tracking error:", error);
};

export const getPostViewCount = async (postId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("view_count")
    .eq("id", postId)
    .single();

  if (error) return 0;
  return data?.view_count || 0;
};
