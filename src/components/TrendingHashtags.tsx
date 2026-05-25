"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import Link from "next/link";

type Hashtag = {
  id: string;
  tag: string;
  post_count: number;
};

export default function TrendingHashtags() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    const { data } = await supabase
      .from("hashtags")
      .select("*")
      .order("post_count", { ascending: false })
      .limit(5);

    if (data) {
      setHashtags(data);
    }
  };

  if (hashtags.length === 0) return null;

  return (
    <div className="bg-hover rounded-lg p-4 mb-4">
      <h2 className="text-white font-bold text-xl mb-4">Trending</h2>
      <div className="space-y-3">
        {hashtags.map((hashtag, index) => (
          <Link
            key={hashtag.id}
            href={`/home/hashtag/${hashtag.tag}`}
            className="block hover:bg-background/50 p-2 rounded transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-secondary-text text-xs">#{index + 1} · Trending</p>
                <p className="text-white font-semibold">#{hashtag.tag}</p>
                <p className="text-secondary-text text-xs">{hashtag.post_count} posts</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
