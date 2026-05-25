import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../lib/SupabaseClient";

const getFollowingTweets = async (pageParam: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get list of users you follow
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (!following || following.length === 0) {
    return { tweets: [], nextPage: null };
  }

  const followingIds = following.map(f => f.following_id);

  const startIndex = pageParam * 10;
  const endIndex = startIndex + 9;

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,content,image_url,image_path,created_at,user_id,is_pinned,
      profiles!inner(id, username, avatar_url, name, is_owner, role)
    `)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(startIndex, endIndex);

  if (error) throw error;

  return {
    tweets: data,
    nextPage: data.length === 10 ? pageParam + 1 : null,
  };
};

export const useGetFollowingTweets = () => {
  return useInfiniteQuery({
    queryKey: ["following-tweets"],
    queryFn: ({ pageParam = 0 }) => getFollowingTweets(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};
