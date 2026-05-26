"use client";
import { useEffect, useState } from "react";
import { followUser, unfollowUser, getFollowStatus } from "../../services/follow";

type Props = {
  targetUserId: string;
  initialIsFollowing?: boolean;
  initialIsFollowedBy?: boolean;
  onChange?: (status: { isFollowing: boolean; isFollowedBy: boolean }, action?: "follow" | "unfollow") => void;
  className?: string;
  showAsTextWhenFollowing?: boolean;
  disabled?: boolean;
  ariaLabel?: string; // e.g. username or display name for screen readers
};

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialIsFollowedBy,
  onChange,
  className,
  showAsTextWhenFollowing,
  disabled,
  ariaLabel,
}: Props) {
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(initialIsFollowing);
  const [isFollowedBy, setIsFollowedBy] = useState<boolean | undefined>(initialIsFollowedBy);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (typeof isFollowing === "undefined" || typeof isFollowedBy === "undefined") {
      (async () => {
        const status = await getFollowStatus(targetUserId);
        if (!mounted) return;
        setIsFollowing(status.isFollowing);
        setIsFollowedBy(status.isFollowedBy);
        onChange?.(status);
      })();
    }
    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        const res: any = await unfollowUser(targetUserId);
        if (res.error) throw new Error(res.error);
        // update local state
        const status = await getFollowStatus(targetUserId);
        setIsFollowing(status.isFollowing);
        setIsFollowedBy(status.isFollowedBy);
        onChange?.(status, "unfollow");
      } else {
        const res: any = await followUser(targetUserId);
        if (res.error) throw new Error(res.error);
        const status = await getFollowStatus(targetUserId);
        setIsFollowing(status.isFollowing);
        setIsFollowedBy(status.isFollowedBy);
        onChange?.(status, "follow");
      }
    } catch (err: any) {
      console.error("FollowButton error:", err);
      alert(err?.message || "Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  // preserve previous WhoToFollow behaviour: render text when following
  if (isFollowing && showAsTextWhenFollowing) {
    return <span className="text-secondary-text text-sm" aria-live="polite">Following</span>;
  }

  const defaultClass = isFollowing
    ? "mt-16 px-6 py-2 rounded-full font-bold transition-all bg-transparent border border-border text-white hover:bg-red-500/10 hover:border-red-500 hover:text-red-500"
    : "bg-white text-black px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const baseLabel = ariaLabel || "user";
  const computedLabel = isLoading
    ? `Working` 
    : isFollowing
    ? isHovering
      ? `Unfollow ${baseLabel}`
      : `Following ${baseLabel}`
    : isFollowedBy
    ? `Follow back ${baseLabel}`
    : `Follow ${baseLabel}`;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={className ?? defaultClass}
      aria-pressed={!!isFollowing}
      aria-label={computedLabel}
      title={computedLabel}
    >
      {isLoading ? "..." : isFollowing ? (isHovering ? "Unfollow" : "Following") : isFollowedBy ? "Follow Back" : "Follow"}
    </button>
  );
}
