"use client";
import { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsAsRead } from "../../../../services/notification";
import { Notification } from "../../../../types/types";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import { SpinnerCircularFixed } from "spinners-react";
import { BiBell } from "react-icons/bi";
import OwnerBadge from "@/components/OwnerBadge";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    const result = await getNotifications();
    if (result.data) {
      setNotifications(result.data as any);
    }
    setIsLoading(false);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-white font-bold text-xl">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-primary text-sm hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <BiBell size={60} className="text-secondary-text mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">No notifications yet</p>
          <p className="text-secondary-text">When someone likes, comments, or follows you, you'll see it here.</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={
                notification.type === "follow"
                  ? `/home/profile/${notification.actor.username}`
                  : `/home/post/${notification.post_id}`
              }
              className={`px-4 py-3 flex gap-3 border-b border-border hover:bg-hover transition-colors ${
                !notification.is_read ? "bg-primary/5" : ""
              }`}
            >
              <div className="shrink-0">
                {notification.type === "like" && (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-500 text-xl">❤️</span>
                  </div>
                )}
                {notification.type === "comment" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xl">💬</span>
                  </div>
                )}
                {notification.type === "follow" && (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 text-xl">👤</span>
                  </div>
                )}
                {notification.type === "repost" && (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 text-xl">🔁</span>
                  </div>
                )}
              </div>

              <Image
                src={notification.actor.avatar_url}
                alt={notification.actor.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-white font-bold">{notification.actor.name}</span>
                  <OwnerBadge isOwner={notification.actor.is_owner} size="sm" />
                  <span className="text-secondary-text text-sm">
                    @{notification.actor.username}
                  </span>
                </div>

                <p className="text-white text-sm mb-1">
                  {notification.type === "like" && "liked your post"}
                  {notification.type === "comment" && "commented on your post"}
                  {notification.type === "follow" && "followed you"}
                  {notification.type === "repost" && "reposted your post"}
                </p>

                {notification.post?.content && (
                  <p className="text-secondary-text text-sm truncate">
                    {notification.post.content}
                  </p>
                )}

                <p className="text-secondary-text text-xs mt-1">
                  {moment(notification.created_at).fromNow()}
                </p>
              </div>

              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
