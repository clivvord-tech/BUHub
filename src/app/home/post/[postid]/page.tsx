"use client";
import Comments from "@/components/Comments";
import GoBackButton from "@/components/GoBackButton";
import ReplyPost from "@/components/ReplyPost";
import OwnerBadge from "@/components/OwnerBadge";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { supabase } from "../../../../../lib/SupabaseClient";
import { Tweet } from "../../../../../types/types";
import moment from "moment";
import TweetActions from "@/components/TweetActions";
import PostOptionsMenu from "@/components/PostOptionsMenu";
import { trackPostView } from "../../../../../services/views";
import { SpinnerCircularFixed } from "spinners-react";

export default function Page({ params }: { params: Promise<{ postid: string }> }) {
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [postId, setPostId] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id);
    });
  }, []);

  useEffect(() => {
    params.then(p => {
      setPostId(p.postid);
      getTweet(p.postid);
    });
  }, [params]);

  useEffect(() => {
    if (postId) {
      trackPostView(postId);
    }
  }, [postId]);

  const getTweet = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error, data } = await supabase
      .from("posts")
      .select("id,content,image_url,image_path,created_at,user_id,is_pinned,profiles!posts_user_id_fkey(id,username,avatar_url,name,is_owner,role)")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }

    const transformedData = {
      ...data,
      profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    };

    setTweet(transformedData as Tweet);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-red-500 font-semibold">Post not found</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-4 py-2">
        <div className="text-white flex items-center gap-3">
          <GoBackButton />
          <span className="font-bold text-xl">Post</span>
        </div>
      </div>
      <div className="px-4 py-2 flex gap-3 border-b border-border">
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
            <PostOptionsMenu
              tweetId={tweet.id}
              creatorId={tweet.profiles.id}
              currentUserId={currentUserId}
              imagePath={tweet.image_path}
              isTweetPostViewPage={true}
              creatorUsername={tweet.profiles.username}
              isPinned={tweet.is_pinned}
            />
          </div>
          {tweet.content && (
            <div className="text-white my-2 block">{tweet.content}</div>
          )}
          {tweet.image_url && (
            <div>
              <Image
                src={tweet.image_url}
                alt="post-image"
                width={1800}
                height={1800}
                className="h-70 md:h-130 w-full rounded-lg border border-border object-cover"
              />
            </div>
          )}
          <TweetActions
            creatorId={tweet.profiles.id}
            tweetId={tweet.id}
            imagePath={tweet.image_path}
            isTweetPostViewPage={true}
            isPinned={tweet.is_pinned}
          />
        </div>
      </div>
      <ReplyPost tweetId={tweet.id}/>
      <Comments tweetId={tweet.id}/>
    </div>
  );
}
