"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile, getUserPosts } from "../../../../../services/profile";
import { followUser, unfollowUser, checkIfFollowing } from "../../../../../services/follow";
import { ProfileStats, Tweet } from "../../../../../types/types";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { SpinnerCircularFixed } from "spinners-react";
import OwnerBadge from "@/components/OwnerBadge";
import TweetActions from "@/components/TweetActions";
import Link from "next/link";
import moment from "moment";
import { useGetUser } from "../../../../../custom-hooks/useGetUser";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { profile: currentUser } = useGetUser();

  const [profile, setProfile] = useState<ProfileStats | null>(null);
  const [posts, setPosts] = useState<Tweet[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === profile?.id;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setIsLoading(true);
    const profileResult = await getUserProfile(username);
    if (profileResult.error || !profileResult.data) {
      setIsLoading(false);
      return;
    }

    setProfile(profileResult.data);

    const postsResult = await getUserPosts(profileResult.data.id);
    if (postsResult.data) {
      setPosts(postsResult.data as any);
    }

    if (currentUser?.id && currentUser.id !== profileResult.data.id) {
      const following = await checkIfFollowing(profileResult.data.id);
      setIsFollowing(following);
    }

    setIsLoading(false);
  };

  const handleFollow = async () => {
    if (!profile) return;
    setIsFollowLoading(true);

    if (isFollowing) {
      await unfollowUser(profile.id);
      setIsFollowing(false);
      setProfile({ ...profile, followers_count: profile.followers_count - 1 });
    } else {
      await followUser(profile.id);
      setIsFollowing(true);
      setProfile({ ...profile, followers_count: profile.followers_count + 1 });
    }

    setIsFollowLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-white font-semibold">User not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4 z-10">
        <button onClick={() => router.back()} className="text-white hover:bg-hover rounded-full p-2">
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg flex items-center gap-1">
            {profile.name}
            <OwnerBadge isOwner={profile.is_owner} size="sm" />
          </h1>
          <p className="text-secondary-text text-xs">{profile.posts_count} posts</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="border-b border-border">
        <div className="h-40 bg-hover"></div>
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <Image
              src={profile.avatar_url}
              alt={profile.name}
              width={130}
              height={130}
              className="w-32 h-32 rounded-full border-4 border-background object-cover"
            />
            {!isOwnProfile ? (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`mt-16 px-6 py-2 rounded-full font-bold transition-all ${
                  isFollowing
                    ? "bg-transparent border border-border text-white hover:bg-red-500/10 hover:border-red-500 hover:text-red-500"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isFollowLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            ) : (
              <button className="mt-16 px-6 py-2 rounded-full font-bold bg-transparent border border-border text-white hover:bg-hover transition-all opacity-50 cursor-not-allowed" disabled title="Coming Soon">
                Edit profile
              </button>
            )}
          </div>

          <div className="mb-3">
            <h2 className="text-white font-bold text-xl flex items-center gap-1">
              {profile.name}
              <OwnerBadge isOwner={profile.is_owner} size="md" />
            </h2>
            <p className="text-secondary-text">@{profile.username}</p>
          </div>

          {profile.bio && <p className="text-white mb-3">{profile.bio}</p>}

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-white font-bold">{profile.following_count}</span>
              <span className="text-secondary-text ml-1">Following</span>
            </div>
            <div>
              <span className="text-white font-bold">{profile.followers_count}</span>
              <span className="text-secondary-text ml-1">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b border-border grid text-center ${profile.is_owner ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <button className="py-4 text-white font-semibold border-b-2 border-primary hover:bg-hover transition-colors">
          Posts
        </button>
        {profile.is_owner && (
          <button className="py-4 text-secondary-text font-semibold hover:bg-hover transition-colors opacity-50 cursor-not-allowed" disabled title="Coming Soon">
            Articles
          </button>
        )}
        <button className="py-4 text-secondary-text font-semibold hover:bg-hover transition-colors opacity-50 cursor-not-allowed" disabled title="Coming Soon">
          Media
        </button>
        <button className="py-4 text-secondary-text font-semibold hover:bg-hover transition-colors opacity-50 cursor-not-allowed" disabled title={isOwnProfile ? "Coming Soon" : "This user's likes are private"}>
          Likes
        </button>
      </div>

      {/* Posts */}
      <div>
        {posts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-secondary-text">No posts yet</p>
          </div>
        ) : (
          posts.map((tweet) => (
            <div
              key={tweet.id}
              className="px-4 py-2 flex gap-3 border-b border-border hover:bg-hover transition-colors"
            >
              <Image
                src={tweet.profiles.avatar_url}
                alt="profile-pic"
                width={100}
                height={100}
                className="w-10 h-10 object-cover rounded-full shrink-0"
              />
              <div className="w-full">
                <div className="flex gap-1 items-center text-sm">
                  <span className="text-white font-bold">{tweet.profiles.name}</span>
                  <OwnerBadge isOwner={tweet.profiles.is_owner} size="sm" />
                  <span className="text-secondary-text">@{tweet.profiles.username}</span>
                  <span className="text-secondary-text">{moment(tweet.created_at).fromNow()}</span>
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
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
