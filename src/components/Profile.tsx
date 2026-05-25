"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { useGetUser } from "../../custom-hooks/useGetUser";
import { SpinnerCircularFixed } from "spinners-react";
import OwnerBadge from "./OwnerBadge";
import LogoutButton from "./LogoutButton";
import { supabase } from "../../lib/SupabaseClient";

export default function Profile() {
  const { session, loading, profile, gettingSession } = useGetUser();
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

  useEffect(() => {
    if (profile?.id) {
      loadStats();
    }
  }, [profile?.id]);

  const loadStats = async () => {
    if (!profile?.id) return;

    const [postsCount, followersCount, followingCount] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    ]);

    setStats({
      posts: postsCount.count || 0,
      followers: followersCount.count || 0,
      following: followingCount.count || 0,
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-4">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  if (gettingSession)
    return (
      <div className="flex justify-center items-center py-4">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  if (!session) return null;
  if (!profile) return null;
  return (
    <Link href={`/home/profile/${profile.username}`} className="mt-10 text-white rounded-lg transition-colors cursor-pointer">
      <div className="flex justify-between items-center hover:bg-hover p-2 rounded-full">
        <div className="flex items-center gap-2">
          {profile?.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt="profile-pic"
              width={500}
              height={500}
              className="w-10 h-10 object-cover rounded-full"
            />
          )}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{profile?.name}</p>
              <OwnerBadge isOwner={profile?.is_owner} size="sm" />
            </div>
            <p className="text-secondary-text font-light">@{profile?.username}</p>
          </div>
        </div>
        <HiDotsHorizontal className="hidden lg:block" />
      </div>
      <div className="hidden lg:flex gap-4 text-sm mt-2 px-2">
        <div>
          <span className="font-bold">{stats.posts}</span>
          <span className="text-secondary-text ml-1">Posts</span>
        </div>
        <div>
          <span className="font-bold">{stats.following}</span>
          <span className="text-secondary-text ml-1">Following</span>
        </div>
        <div>
          <span className="font-bold">{stats.followers}</span>
          <span className="text-secondary-text ml-1">Followers</span>
        </div>
      </div>
      <div className="mt-3">
        <LogoutButton />
      </div>
    </Link>
  );
}
