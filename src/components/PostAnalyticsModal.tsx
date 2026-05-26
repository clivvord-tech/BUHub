"use client";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaEye, FaHeart, FaComment } from "react-icons/fa6";
import { getPostAnalytics, PostAnalytics } from "../../services/analytics";

type PostAnalyticsModalProps = {
  postId: string;
  onClose: () => void;
};

export default function PostAnalyticsModal({ postId, onClose }: PostAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await getPostAnalytics(postId);
      setAnalytics(data);
      setLoading(false);
    };
    loadAnalytics();
  }, [postId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-lg w-full">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Post Activity</h2>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-white transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-secondary-text py-8">Loading analytics...</div>
          ) : analytics ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <FaEye className="text-primary" size={24} />
                  <span className="text-white font-semibold">Views</span>
                </div>
                <span className="text-2xl font-bold text-white">{analytics.viewCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <FaHeart className="text-red-500" size={24} />
                  <span className="text-white font-semibold">Likes</span>
                </div>
                <span className="text-2xl font-bold text-white">{analytics.likeCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <FaComment className="text-primary" size={24} />
                  <span className="text-white font-semibold">Comments</span>
                </div>
                <span className="text-2xl font-bold text-white">{analytics.commentCount}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-secondary-text">
                  Total Engagement: <span className="text-white font-bold">{analytics.likeCount + analytics.commentCount}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-secondary-text py-8">Failed to load analytics</div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
