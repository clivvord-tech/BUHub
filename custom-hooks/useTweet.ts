import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createTweet, deleteTweet, getTweets } from "../services/tweet";
import { getPostRateLimiter } from "../services/rateLimiting";

export const usePostTweet = () => {
  const queryClient = useQueryClient();
  const rateLimiter = getPostRateLimiter();

  return useMutation({
    mutationFn: ({
      userId,
      content,
      tweetImage,
    }: {
      userId: string;
      content: string | null;
      tweetImage: File | null;
    }) => {
      // Check rate limit
      if (!rateLimiter.isAllowed(userId)) {
        throw new Error(
          `Too many posts. Please wait before posting again. (${rateLimiter.getRemainingRequests(userId)} remaining)`
        );
      }
      return createTweet(userId, content, tweetImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });
};

/**
 * Get tweets with infinite scroll support
 */
export const useGetTweets = (pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: ["tweets"],
    queryFn: ({ pageParam = 0 }) => getTweets(pageParam, pageSize),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
  });
};

/**
 * Legacy hook - kept for backward compatibility
 * Use useGetTweets() for new code
 */
export const useGetAllTweets = () => {
  return useQuery({
    queryKey: ["tweets-legacy"],
    queryFn: () => getTweets(0, 100), // Get first 100
  });
};

export const useDeleteTweet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tweetId,
      imagePath,
    }: {
      tweetId: string;
      imagePath?: string;
    }) => deleteTweet(tweetId, imagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });
};
