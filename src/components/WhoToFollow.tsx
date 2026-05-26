"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import Link from "next/link";
import Image from "next/image";
import { getFollowStatuses } from "../../services/follow";
import FollowButton from "./FollowButton";
import OwnerBadge from "./OwnerBadge";

type User = {
  id: string;
  username: string;
  name: string;
  avatar_url: string;
  is_owner: boolean;
};

type FollowStatus = {
  isFollowing: boolean;
  isFollowedBy: boolean;
};

export default function WhoToFollow() {
  const [users, setUsers] = useState<User[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, FollowStatus>>({});
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
      
      // Get follow statuses in batch (single pair of queries)
      const ids = suggestions.map(u => u.id);
      const statuses = await getFollowStatuses(ids);
      const statusMap: Record<string, FollowStatus> = {};
      for (const id of ids) {
        statusMap[id] = statuses[id] || { isFollowing: false, isFollowedBy: false };
      }
      setFollowStatus(statusMap);
    }
  };


  const getButtonText = (status: FollowStatus) => {
    if (status.isFollowing) return "Following";
    if (status.isFollowedBy) return "Follow Back";
    return "Follow";
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
            <FollowButton
              targetUserId={user.id}
              initialIsFollowing={followStatus[user.id]?.isFollowing}
              initialIsFollowedBy={followStatus[user.id]?.isFollowedBy}
              showAsTextWhenFollowing
              ariaLabel={`${user.name} (@${user.username})`}
              onChange={(status, action) => {
                setFollowStatus(prev => ({ ...prev, [user.id]: status }));
                if (action === "follow" || action === "unfollow") {
                  // refresh suggestions shortly after a change
                  setTimeout(() => loadSuggestions(), 500);
                }
              }}
              className="bg-white text-black px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
