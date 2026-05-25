"use client";
import { useEffect, useState } from "react";
import { getBookmarks } from "../../../../services/bookmark";
import Image from "next/image";
import Link from "next/link";
import { SpinnerCircularFixed } from "spinners-react";
import { FaBookmark } from "react-icons/fa6";
import OwnerBadge from "@/components/OwnerBadge";
import TweetActions from "@/components/TweetActions";
import moment from "moment";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setIsLoading(true);
    const result = await getBookmarks();
    if (result.data) {
      setBookmarks(result.data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <h1 className="text-white font-bold text-xl">Bookmarks</h1>
        <p className="text-secondary-text text-sm">@{bookmarks[0]?.posts?.profiles?.username || 'you'}</p>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <FaBookmark size={60} className="text-secondary-text mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">Save posts for later</p>
          <p className="text-secondary-text">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        <div>
          {bookmarks.map((bookmark) => {
            const post = bookmark.posts;
            if (!post) return null;
            
            return (
              <div
                key={bookmark.id}
                className="px-4 py-2 flex gap-3 border-b border-border hover:bg-hover transition-colors"
              >
                <Link href={`/home/profile/${post.profiles.username}`}>
                  <Image
                    src={post.profiles.avatar_url}
                    alt="profile-pic"
                    width={100}
                    height={100}
                    className="w-10 h-10 object-cover rounded-full shrink-0 hover:brightness-90 transition-all"
                  />
                </Link>
                <div className="w-full">
                  <div className="flex gap-1 items-center text-sm mb-1">
                    <Link
                      href={`/home/profile/${post.profiles.username}`}
                      className="text-white font-bold hover:underline"
                    >
                      {post.profiles.name}
                    </Link>
                    <OwnerBadge isOwner={post.profiles.is_owner} size="sm" />
                    <Link
                      href={`/home/profile/${post.profiles.username}`}
                      className="text-secondary-text hover:underline"
                    >
                      @{post.profiles.username}
                    </Link>
                    <span className="text-secondary-text">
                      {moment(post.created_at).fromNow()}
                    </span>
                  </div>
                  {post.content && (
                    <Link
                      href={`/home/post/${post.id}`}
                      className="text-white my-2 block hover:brightness-110"
                    >
                      {post.content}
                    </Link>
                  )}
                  {post.image_url && (
                    <Link href={`/home/post/${post.id}`}>
                      <Image
                        src={post.image_url}
                        alt="post-image"
                        width={1800}
                        height={1800}
                        className="h-70 md:h-130 w-full rounded-lg border border-border object-cover hover:brightness-95 transition-all"
                      />
                    </Link>
                  )}
                  <TweetActions
                    creatorId={post.profiles.id}
                    tweetId={post.id}
                    imagePath={post.image_path || ""}
                    isTweetPostViewPage={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
