import { supabase } from "../lib/SupabaseClient";
import { sanitizeTweetContent } from "./sanitization";

export const createTweet = async (
  userId: string,
  content: string | null,
  tweetImage: File | null
) => {
  let imageURL: null | string = null;
  let imagePath: null | string = null;

  //handle image uploaded
  if (tweetImage) {
    const timestamp = Date.now();
    const path = `${timestamp}_${tweetImage.name}`;

    const { error: imgError } = await supabase.storage
      .from("posts")
      .upload(path, tweetImage);

    if (imgError) {
      console.log("TweetImageUploadError:", imgError.message);
      throw new Error("Failed to upload image. Please try again.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("posts").getPublicUrl(path);

    imageURL = publicUrl;
    imagePath = path;
  }

  // Sanitize content
  const sanitizedContent = content ? sanitizeTweetContent(content) : null;

  if (!sanitizedContent && !imageURL) {
    throw new Error("Post must contain text or an image");
  }

  //save tweets
  const { error: insertError } = await supabase.from("posts").insert({
    user_id: userId,
    content: sanitizedContent,
    image_url: imageURL,
    image_path: imagePath,
  });

  if (insertError) {
    console.log("TweetInsertError:", insertError.message);
    throw new Error("Failed to create post. Please try again.");
  }

  return true;
};

/**
 * Get tweets with pagination support
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of tweets per page (default: 10)
 */
export const getTweets = async (page: number = 0, pageSize: number = 10) => {
  const start = page * pageSize;
  const end = start + pageSize - 1;

  const { error, data, count } = await supabase
    .from("posts")
    .select(
      `*,profiles(id,username,name,avatar_url,is_owner,role)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.log("fetchTweetsError:", error.message);
    throw new Error("Failed to load posts");
  }

  return {
    tweets: data || [],
    total: count || 0,
    page,
    pageSize,
    hasMore: (page + 1) * pageSize < (count || 0),
  };
};

export const deleteTweet = async (tweetId: string, imagePath?: string) => {
  //delete the tweet record
  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", tweetId);

  if (deleteError) {
    console.log("DeleteTweetError", deleteError.message);
    throw new Error("Failed to delete post");
  }

  if (imagePath) {
    const { error: imageError } = await supabase.storage
      .from("posts")
      .remove([imagePath]);

    if (imageError) {
      console.log("ImageDeleteError", imageError.message);
      // Don't throw - image deletion failure shouldn't block post deletion
    }
  }
};
