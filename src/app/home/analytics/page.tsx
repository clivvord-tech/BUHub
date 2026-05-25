"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/SupabaseClient";
import { SpinnerCircularFixed } from "spinners-react";
import GoBackButton from "@/components/GoBackButton";
import { useGetUser } from "../../../../custom-hooks/useGetUser";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const { profile } = useGetUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollows: 0,
    totalBookmarks: 0,
    totalReposts: 0,
    totalViews: 0,
  });

  useEffect(() => {
    if (profile && !profile.is_owner) {
      router.replace("/home");
      return;
    }
    if (profile?.is_owner) {
      loadStats();
    }
  }, [profile, router]);

  const loadStats = async () => {
    const [users, posts, likes, comments, follows, bookmarks, reposts, views] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("likes").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("follows").select("*", { count: "exact", head: true }),
      supabase.from("bookmarks").select("*", { count: "exact", head: true }),
      supabase.from("reposts").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("view_count"),
    ]);

    const totalViews = views.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

    setStats({
      totalUsers: users.count || 0,
      totalPosts: posts.count || 0,
      totalLikes: likes.count || 0,
      totalComments: comments.count || 0,
      totalFollows: follows.count || 0,
      totalBookmarks: bookmarks.count || 0,
      totalReposts: reposts.count || 0,
      totalViews,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  if (!profile?.is_owner) {
    return null;
  }

  return (
    <div>
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 z-10 flex items-center gap-3">
        <GoBackButton />
        <h1 className="text-white font-bold text-xl">Platform Analytics</h1>
      </div>

      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Users</p>
            <p className="text-white text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Posts</p>
            <p className="text-white text-3xl font-bold">{stats.totalPosts.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Views</p>
            <p className="text-white text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Likes</p>
            <p className="text-white text-3xl font-bold">{stats.totalLikes.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Comments</p>
            <p className="text-white text-3xl font-bold">{stats.totalComments.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Follows</p>
            <p className="text-white text-3xl font-bold">{stats.totalFollows.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Reposts</p>
            <p className="text-white text-3xl font-bold">{stats.totalReposts.toLocaleString()}</p>
          </div>

          <div className="bg-hover border border-border rounded-lg p-6">
            <p className="text-secondary-text text-sm mb-2">Total Bookmarks</p>
            <p className="text-white text-3xl font-bold">{stats.totalBookmarks.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 bg-hover border border-border rounded-lg p-6">
          <p className="text-secondary-text text-sm mb-2">Engagement Rate</p>
          <p className="text-white text-3xl font-bold">
            {stats.totalPosts > 0
              ? ((stats.totalLikes + stats.totalComments + stats.totalReposts) / stats.totalPosts).toFixed(2)
              : "0.00"}
          </p>
          <p className="text-secondary-text text-xs mt-1">Average interactions per post</p>
        </div>
      </div>
    </div>
  );
}
