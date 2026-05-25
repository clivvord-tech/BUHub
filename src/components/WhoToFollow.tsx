"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import Link from "next/link";
import Image from "next/image";
import { followUser } from "../../services/follow";

type User = {
  id: string;
  username: string;
  name: string;
  avatar_url: string;
  is_owner: boolean;
};

export default function WhoToFollow() {
  const [users, setUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: followingData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = followingData?.map(f => f.following_id) || [];

    const { data } = await supabase
      .from("profiles")
      .select("id, username, name, avatar_url, is_owner")
      .neq("id", user.id)
      .not("id", "in", `(${followingIds.join(",")})`)
      .limit(3);

    if (data) {
      setUsers(data);
    }
  };

  const handleFollow = async (userId: string) => {
    await followUser(userId);
    setFollowing(prev => new Set(prev).add(userId));
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
                <p className="text-white font-semibold truncate">{user.name}</p>
                <p className="text-secondary-text text-sm truncate">@{user.username}</p>
              </div>
            </Link>
            {!following.has(user.id) && (
              <button
                onClick={() => handleFollow(user.id)}
                className="bg-white text-black px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
