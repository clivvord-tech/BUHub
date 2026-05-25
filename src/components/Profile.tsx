"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { useGetUser } from "../../custom-hooks/useGetUser";
import { SpinnerCircularFixed } from "spinners-react";
import OwnerBadge from "./OwnerBadge";
import { supabase } from "../../lib/SupabaseClient";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { session, loading, profile, gettingSession } = useGetUser();
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (profile?.id) {
      loadStats();
    }
  }, [profile?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
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
    <div className="mt-10 text-white relative" ref={menuRef}>
      <div 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex justify-between items-center hover:bg-hover p-2 rounded-full cursor-pointer"
      >
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

      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-background border border-border rounded-lg shadow-lg">
          <button
            onClick={() => alert("Add existing account - Coming soon")}
            className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors"
          >
            <span className="font-semibold">Add an existing account</span>
          </button>
          <button
            onClick={() => alert("Manage accounts - Coming soon")}
            className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors border-t border-border"
          >
            <span className="font-semibold">Manage accounts</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors border-t border-border"
          >
            <span className="font-semibold">Log out @{profile?.username}</span>
          </button>
        </div>
      )}
    </div>
  );
}
