"use client";
import { useState } from "react";
import { supabase } from "../../../../lib/SupabaseClient";
import Image from "next/image";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { SpinnerCircularFixed } from "spinners-react";
import OwnerBadge from "@/components/OwnerBadge";
import moment from "moment";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setIsLoading(true);

    if (activeTab === "users") {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, name, avatar_url, bio, is_owner")
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(20);
      setUsers(data || []);
    } else {
      const { data } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          image_url,
          created_at,
          profiles(id, username, name, avatar_url, is_owner)
        `)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      setPosts(data || []);
    }

    setIsLoading(false);
  };

  const handleTabChange = (tab: "users" | "posts") => {
    setActiveTab(tab);
    setUsers([]);
    setPosts([]);
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <h1 className="text-white font-bold text-xl mb-3">Explore</h1>
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search BinghamHub"
            className="w-full bg-hover border border-border rounded-full py-2 pl-10 pr-4 text-white placeholder-secondary-text outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border grid grid-cols-2 text-center">
        <button
          onClick={() => handleTabChange("users")}
          className={`py-4 font-semibold transition-colors ${
            activeTab === "users"
              ? "text-white border-b-2 border-primary"
              : "text-secondary-text hover:bg-hover"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => handleTabChange("posts")}
          className={`py-4 font-semibold transition-colors ${
            activeTab === "posts"
              ? "text-white border-b-2 border-primary"
              : "text-secondary-text hover:bg-hover"
          }`}
        >
          Posts
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <SpinnerCircularFixed size={25} color="#1DA1F2" />
        </div>
      ) : !searchQuery.trim() ? (
        <div className="px-4 py-20 text-center">
          <IoSearchOutline size={60} className="text-secondary-text mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">Search BinghamHub</p>
          <p className="text-secondary-text">
            Find users and posts from the Bingham University community
          </p>
        </div>
      ) : activeTab === "users" ? (
        users.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-secondary-text">No users found for "{searchQuery}"</p>
          </div>
        ) : (
          <div>
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/home/profile/${user.username}`}
                className="px-4 py-3 flex gap-3 border-b border-border hover:bg-hover transition-colors"
              >
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold">{user.name}</span>
                    <OwnerBadge isOwner={user.is_owner} size="sm" />
                  </div>
                  <p className="text-secondary-text text-sm">@{user.username}</p>
                  {user.bio && (
                    <p className="text-white text-sm mt-1 line-clamp-2">{user.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        posts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-secondary-text">No posts found for "{searchQuery}"</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/home/post/${post.id}`}
                className="px-4 py-3 border-b border-border hover:bg-hover transition-colors block"
              >
                <div className="flex gap-2 items-center mb-2">
                  <Image
                    src={post.profiles.avatar_url}
                    alt={post.profiles.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-white font-bold text-sm">{post.profiles.name}</span>
                  <OwnerBadge isOwner={post.profiles.is_owner} size="sm" />
                  <span className="text-secondary-text text-sm">@{post.profiles.username}</span>
                  <span className="text-secondary-text text-sm">·</span>
                  <span className="text-secondary-text text-sm">{moment(post.created_at).fromNow()}</span>
                </div>
                <p className="text-white">{post.content}</p>
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt="post"
                    width={400}
                    height={400}
                    className="mt-2 rounded-lg border border-border w-full max-h-80 object-cover"
                  />
                )}
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
