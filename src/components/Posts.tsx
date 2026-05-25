"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { BsThreeDots, BsPinFill } from "react-icons/bs";
import { useGetTweets } from "../../custom-hooks/useTweet";
import { Tweet } from "../../types/types";
import moment from "moment";
import TweetActions from "./TweetActions";
import { SpinnerCircularFixed } from "spinners-react";
import OwnerBadge from "./OwnerBadge";

export default function Posts() {
  const { isLoading, isError, error, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetTweets();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-red-500 font-semibold">{error?.message || "Failed to load posts"}</p>
        <p className="text-secondary-text text-sm mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  const tweets = data?.pages.flatMap((page) => page.tweets) || [];

  if (tweets.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-secondary-text">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet: Tweet) => (
        <div key={tweet.id}>
          {tweet.is_pinned && (
            <div className="px-4 pt-2 flex items-center gap-2 text-secondary-text text-sm">
              <BsPinFill className="text-primary" />
              <span>Pinned post</span>
            </div>
          )}
          <div
            className="px-4 py-2 flex gap-3 border-b border-border hover:bg-hover transition-colors"
          >
            <Link href={`/home/profile/${tweet.profiles.username}`}>
              <Image
                src={tweet.profiles.avatar_url}
                alt="profile-pic"
                width={100}
                height={100}
                className="w-10 h-10 object-cover rounded-full shrink-0 hover:brightness-90 transition-all"
              />
            </Link>
            <div className="w-full">
              <div className="flex justify-between">
                <div className="flex gap-1 items-center text-sm">
                  <Link href={`/home/profile/${tweet.profiles.username}`} className="text-white font-bold hover:underline">
                    {tweet.profiles.name}
                  </Link>
                  <OwnerBadge isOwner={tweet.profiles.is_owner} size="sm" />
                  <Link href={`/home/profile/${tweet.profiles.username}`} className="text-secondary-text hover:underline">
                    @{tweet.profiles.username}
                  </Link>
                  <span className="text-secondary-text">
                    {moment(tweet.created_at).fromNow()}
                  </span>
                </div>
                <BsThreeDots className="text-secondary-text" />
              </div>
              {tweet.content && (
                <Link
                  href={`/home/post/${tweet.id}`}
                  className="text-white my-2 block hover:brightness-110"
                >
                  {tweet.content}
                </Link>
              )}
              {tweet.image_url && (
                <Link href={`/home/post/${tweet.id}`}>
                  <Image
                    src={tweet.image_url}
                    alt="post-image"
                    width={1800}
                    height={1800}
                    className="h-70 md:h-130 w-full rounded-lg border border-border object-cover hover:brightness-95 transition-all"
                  />
                </Link>
              )}
              <TweetActions
                creatorId={tweet.profiles.id}
                tweetId={tweet.id}
                imagePath={tweet.image_path}
                isTweetPostViewPage={false}
                isPinned={tweet.is_pinned}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-8 text-center">
        {isFetchingNextPage && <SpinnerCircularFixed size={20} color="#1DA1F2" />}
        {!hasNextPage && tweets.length > 0 && (
          <p className="text-secondary-text text-sm">No more posts</p>
        )}
      </div>
    </div>
  );
}
