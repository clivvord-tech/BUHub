"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import Link from "next/link";
import Image from "next/image";
import { followUser, checkIfFollowing } from "../../services/follow";
import OwnerBadge from "./OwnerBadge";

type User = {
  id: string;
  username: string;
  name: string;
  avatar_url: string;
  is_owner: boolean;
};

export default function WhoToFollow() {
  const [users, setUsers] = useState<User[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get users the current user is already following
    const { data: followingData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = followingData?.map(f => f.following_id) || [];

    // Get suggested users (not following yet, excluding self)
    const { data } = await supabase
      .from("profiles")
      .select("id, username, name, avatar_url, is_owner")
      .neq("id", user.id)
      .limit(10);

    if (data) {
      // Filter out users already following
      const suggestions = data.filter(u => !followingIds.includes(u.id)).slice(0, 3);
      setUsers(suggestions);
      
      // Initialize following status for each user
      const status: Record<string, boolean> = {};
      for (const suggestedUser of suggestions) {
        status[suggestedUser.id] = await checkIfFollowing(suggestedUser.id);
      }
      setFollowingStatus(status);
    }
  };

  const handleFollow = async (userId: string) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    
    const result = await followUser(userId);
    
    if (result.success) {
      // Update local state
      setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      
      // Reload suggestions after a short delay
      setTimeout(() => {
        loadSuggestions();
      }, 500);
    } else {
      console.error("Follow failed:", result.error);
      alert(result.error || "Failed to follow user");
    }
    
    setLoadingStates(prev => ({ ...prev, [userId]: false }));
  };

  if (users.length === 0) return null;

  return (
    <div className="bg-hover rounded-lg p-4">
      <h2 className="text-white font-bold text-xl mb-4">Who to follow</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link href={`/home/profile/${user.username}`} className="flex items-center gap-2 flex-1">
              <Image
                src={user.avatar_url}
                alt={user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <OwnerBadge isOwner={user.is_owner} size="sm" />
                </div>
                <p className="text-secondary-text text-sm truncate">@{user.username}</p>
              </div>
            </Link>
            {!followingStatus[user.id] && (
              <button
                onClick={() => handleFollow(user.id)}
                disabled={loadingStates[user.id]}
                className="bg-white text-black px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates[user.id] ? "..." : "Follow"}
              </button>
            )}
            {followingStatus[user.id] && (
              <span className="text-secondary-text text-sm">Following</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
