"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useGetComments } from "../../custom-hooks/useComment";
import { Comment } from "../../types/types";
import moment from "moment";
import CommentActions from "./CommentActions";
import OwnerBadge from "./OwnerBadge";
import PostOptionsMenu from "./PostOptionsMenu";
import { useUserSession } from "../../custom-hooks/useUserSession";

export default function Comments({ tweetId }: { tweetId: string }) {
  const { error, isError, isLoading, data: comments } = useGetComments(tweetId);
  const { session } = useUserSession();

  if (isLoading) return <h1 className="text-white text-xl">Loading...</h1>;
  if (isError) return <h1 className="text-white text-2xl">{error.message}</h1>;
  return (
    <div>
      {comments?.map((comment: Comment) => {
        return (
          <div
            key={comment.id}
            className="px-4 py-2 flex gap-3 border-b border-border"
          >
            <Link href={`/home/profile/${comment.profiles.username}`} onClick={(e) => e.stopPropagation()}>
              <Image
                src={comment.profiles.avatar_url}
                alt="profile-pic"
                width={100}
                height={100}
                className="w-10 h-10 object-cover rounded-full shrink-0 hover:brightness-90 transition-all"
              />
            </Link>
            <div className="w-full">
              <div className="flex justify-between">
                <div className="flex gap-1 items-center text-sm flex-wrap">
                  <Link href={`/home/profile/${comment.profiles.username}`} onClick={(e) => e.stopPropagation()} className="text-white font-bold hover:underline truncate max-w-[80px] md:max-w-none">
                    {comment.profiles.name}
                  </Link>
                  <OwnerBadge isOwner={comment.profiles.is_owner} size="sm" />
                  <Link href={`/home/profile/${comment.profiles.username}`} onClick={(e) => e.stopPropagation()} className="text-secondary-text hover:underline truncate max-w-[80px] md:max-w-none">
                    @{comment.profiles.username}
                  </Link>
                  <span className="text-secondary-text">·</span>
                  <span className="text-secondary-text whitespace-nowrap">
                    {moment(comment.created_at).diff(moment(), 'hours') > -24 
                      ? moment(comment.created_at).fromNow(true).replace(' ago', '')
                      : moment(comment.created_at).format('MMM D')}
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <PostOptionsMenu
                    tweetId={comment.id}
                    creatorId={comment.profiles.id}
                    currentUserId={session?.user.id}
                    creatorUsername={comment.profiles.username}
                    isComment={true}
                  />
                </div>
              </div>
              <div className="text-white my-2 block">{comment.content}</div>
              <div onClick={(e) => e.stopPropagation()}>
                <CommentActions
                  creatorId={comment.profiles.id}
                  commentId={comment.id}
                  tweetId={comment.tweet_id}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
