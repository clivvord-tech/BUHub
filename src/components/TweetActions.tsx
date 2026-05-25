"use client";
import React, { useEffect, useState } from "react";
import {
  FaBookmark,
  FaRegBookmark,
  FaRegComment,  
  FaTrash,
} from "react-icons/fa6";
import { FiRepeat } from "react-icons/fi";
import { IoIosStats } from "react-icons/io";
import { BsPin, BsPinFill } from "react-icons/bs";
import { useUserSession } from "../../custom-hooks/useUserSession";
import { useDeleteTweet } from "../../custom-hooks/useTweet";
import { useRouter } from "next/navigation";
import { useCommentsCount } from "../../custom-hooks/useComment";
import LikeButton from "./LikeButton";
import { addBookmark, removeBookmark, checkIfBookmarked } from "../../services/bookmark";
import { addRepost, removeRepost, checkIfReposted, getRepostCount, pinPost, unpinPost } from "../../services/repost";
import { getPostViewCount } from "../../services/views";

type TweetActionsProp = {
  creatorId: string;
  tweetId: string;
  imagePath: string;
  isTweetPostViewPage: boolean;
  isPinned?: boolean;
  showOnlyPinDelete?: boolean;
  showOnlyPin?: boolean;
};

export default function TweetActions({
  creatorId,
  tweetId,
  imagePath,
  isTweetPostViewPage,
  isPinned = false,
  showOnlyPinDelete = false,
  showOnlyPin = false,
}: TweetActionsProp) {
  const { mutate } = useDeleteTweet();
  const { session } = useUserSession();
  const {data:commentsCount} = useCommentsCount(tweetId);
  const userId = session?.user.id;
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [pinned, setPinned] = useState(isPinned);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (userId) {
      checkIfBookmarked(tweetId).then(setIsBookmarked);
      checkIfReposted(tweetId).then(setIsReposted);
      getRepostCount(tweetId).then(setRepostCount);
      getPostViewCount(tweetId).then(setViewCount);
    }
  }, [tweetId, userId]);

  const handleDeleteTweet = () => {
    if (!confirm("You're about to delete this post. Are you sure?")) {
      return;
    }
    
    mutate(
      {
        tweetId,
        imagePath: imagePath || undefined,
      },
      {
        onSuccess: () => {
          if (isTweetPostViewPage) {
            router.replace("/home");
          }
        },
      }
    );
  };

  const handleBookmark = async () => {
    if (isBookmarked) {
      await removeBookmark(tweetId);
      setIsBookmarked(false);
    } else {
      await addBookmark(tweetId);
      setIsBookmarked(true);
    }
  };

  const handleRepost = async () => {
    if (isReposted) {
      await removeRepost(tweetId);
      setIsReposted(false);
      setRepostCount(prev => prev - 1);
    } else {
      await addRepost(tweetId);
      setIsReposted(true);
      setRepostCount(prev => prev + 1);
    }
  };

  const handlePin = async () => {
    if (pinned) {
      await unpinPost(tweetId);
      setPinned(false);
    } else {
      await pinPost(tweetId);
      setPinned(true);
      window.location.reload();
    }
  };

  if (showOnlyPin && creatorId === userId) {
    return (
      <button
        onClick={handlePin}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          pinned ? 'text-primary' : 'text-secondary-text hover:text-primary'
        }`}
        title={pinned ? "Unpin from profile" : "Pin to profile"}
      >
        {pinned ? <BsPinFill size={16} /> : <BsPin size={16} />}
      </button>
    );
  }

  if (showOnlyPinDelete && creatorId === userId) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handlePin}
          className={`flex items-center gap-1 cursor-pointer transition-colors ${
            pinned ? 'text-primary' : 'text-secondary-text hover:text-primary'
          }`}
          title={pinned ? "Unpin from profile" : "Pin to profile"}
        >
          {pinned ? <BsPinFill size={16} /> : <BsPin size={16} />}
        </button>
        <button
          onClick={handleDeleteTweet}
          className="text-red-700 flex items-center gap-1 cursor-pointer hover:text-red-500"
          title="Delete post"
        >
          <FaTrash size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between my-4">
      <div className="text-secondary-text flex items-center gap-1 hover:text-blue-400 cursor-pointer">
        <FaRegComment />
        <span className="text-sm">{commentsCount || 0}</span>
      </div>
      <button
        onClick={creatorId === userId ? handleRepost : handleRepost}
        className={`flex items-center gap-1 cursor-pointer transition-colors ${
          isReposted ? 'text-green-500' : 'text-secondary-text hover:text-green-500'
        }`}
      >
        <FiRepeat />
        {repostCount > 0 && <span className="text-sm">{repostCount}</span>}
      </button>
      <LikeButton tweetId={tweetId} userId={userId} session={session}/>
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
        {isBookmarked ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
      </button>
    </div>
  );
}
