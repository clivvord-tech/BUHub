"use client";
import { useEffect, useState } from "react";
import {
  FaBookmark,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
  FaHeart,
} from "react-icons/fa6";
import { FiRepeat } from "react-icons/fi";
import { IoIosStats } from "react-icons/io";
import { useUserSession } from "../../custom-hooks/useUserSession";
import { useDeleteComment } from "../../custom-hooks/useComment";
import { getPostViewCount } from "../../services/views";
import { addBookmark, removeBookmark, checkIfBookmarked } from "../../services/bookmark";
import { addRepost, removeRepost, checkIfReposted, getRepostCount } from "../../services/repost";

type CommentActionsProps = {
  creatorId: string;
  tweetId: string;
  commentId: string;
};

export default function CommentActions({ creatorId, commentId, tweetId }: CommentActionsProps) {
  const { session } = useUserSession();
  const userId = session?.user.id;
  const { mutate } = useDeleteComment();
  const [viewCount, setViewCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [repliesCount, setRepliesCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Always fetch public metrics
    getPostViewCount(commentId).then(setViewCount);
    getRepostCount(commentId).then(setRepostCount);
    
    // Fetch user-specific data if logged in
    if (userId) {
      checkIfBookmarked(commentId).then(setIsBookmarked);
      checkIfReposted(commentId).then(setIsReposted);
    }
  }, [commentId, userId]);

  const handleBookmark = async () => {
    if (isBookmarked) {
      await removeBookmark(commentId);
      setIsBookmarked(false);
    } else {
      await addBookmark(commentId);
      setIsBookmarked(true);
    }
  };

  const handleRepost = async () => {
    if (isReposted) {
      await removeRepost(commentId);
      setIsReposted(false);
      setRepostCount(prev => prev - 1);
    } else {
      await addRepost(commentId);
      setIsReposted(true);
      setRepostCount(prev => prev + 1);
    }
  };

  const handleLike = () => {
    if (!session) return;
    // Toggle like optimistically
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  return (
    <div className="flex justify-between my-4">
      <div className="text-secondary-text flex items-center gap-1 opacity-50 cursor-not-allowed" title="Nested comments coming soon">
        <FaRegComment />
        <span className="text-sm">{repliesCount || 0}</span>
      </div>
      <button
        onClick={handleRepost}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          isReposted ? 'text-green-500' : 'text-secondary-text hover:text-green-500'
        }`}
      >
        <FiRepeat />
        {repostCount > 0 && <span className="text-sm">{repostCount}</span>}
      </button>
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          isLiked ? 'text-pink-700 hover:text-pink-400' : 'text-secondary-text hover:text-pink-400'
        }`}
      >
        {isLiked ? <FaHeart /> : <FaRegHeart />}
        {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
      </button>
      <div className="text-secondary-text flex items-center gap-1 hover:text-blue-400 cursor-pointer">
        <IoIosStats />
        {viewCount > 0 && <span className="text-sm">{viewCount}</span>}
      </div>
      <button
        onClick={handleBookmark}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          isBookmarked ? 'text-primary' : 'text-secondary-text hover:text-primary'
        }`}
      >
        {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
      </button>
    </div>
  );
}
