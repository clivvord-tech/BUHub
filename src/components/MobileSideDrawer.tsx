"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsThreeDots } from "react-icons/bs";
import { FaRegUser, FaRegBookmark } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";
import { BsPeople } from "react-icons/bs";
import { useGetUser } from "../../custom-hooks/useGetUser";
import { supabase } from "../../lib/SupabaseClient";
import OwnerBadge from "./OwnerBadge";

type MobileSideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileSideDrawer({ isOpen, onClose }: MobileSideDrawerProps) {
  const { profile } = useGetUser();
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (profile?.id) {
      loadStats();
    }
  }, [profile?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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

  const handleNavClick = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!profile) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`lg:hidden fixed top-0 left-0 h-full w-[62.5%] bg-background z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Top Section */}
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="text-white hover:bg-hover rounded-full p-2 transition-colors"
              >
                <BsThreeDots size={20} />
              </button>
              <Image
                src={profile.avatar_url}
                alt={profile.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-1">
                <h2 className="text-white font-bold text-lg">{profile.name}</h2>
                <OwnerBadge isOwner={profile.is_owner} size="sm" />
              </div>
              <p className="text-secondary-text text-sm">@{profile.username}</p>
            </div>

            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-white font-bold">{stats.following}</span>
                <span className="text-secondary-text ml-1">Following</span>
              </div>
              <div>
                <span className="text-white font-bold">{stats.followers}</span>
                <span className="text-secondary-text ml-1">Followers</span>
              </div>
            </div>
          </div>

          {/* Account Switching Menu */}
          {isAccountMenuOpen && (
            <div className="border-b border-border bg-hover/50">
              <div className="p-4">
                <h3 className="text-white font-bold mb-3">Accounts</h3>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg mb-3">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-white font-semibold">{profile.name}</p>
                      <OwnerBadge isOwner={profile.is_owner} size="sm" />
                    </div>
                    <p className="text-secondary-text text-sm">@{profile.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Add existing account - Coming soon")}
                  className="w-full text-left text-white hover:bg-hover p-3 rounded-lg transition-colors"
                >
                  Add an existing account
                </button>
                <p className="text-secondary-text text-xs mt-2 px-3">
                  If you have more than one account, you can add them and easily switch between. You can add up to 5 accounts.
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white hover:bg-hover p-3 rounded-lg transition-colors mt-3"
                >
                  Log out of all accounts
                </button>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1">
            <button
              onClick={() => handleNavClick(`/home/profile/${profile.username}`)}
              className="w-full flex items-center gap-4 px-4 py-4 text-white hover:bg-hover transition-colors"
            >
              <FaRegUser size={20} />
              <span className="text-lg">Profile</span>
            </button>

            <button
              onClick={() => alert("Premium - Coming soon")}
              className="w-full flex items-center gap-4 px-4 py-4 text-white hover:bg-hover transition-colors"
            >
              <RiVerifiedBadgeFill size={20} />
              <span className="text-lg">Premium</span>
            </button>

            <button
              onClick={() => alert("Communities - Coming soon")}
              className="w-full flex items-center gap-4 px-4 py-4 text-white hover:bg-hover transition-colors"
            >
              <BsPeople size={20} />
              <span className="text-lg">Communities</span>
            </button>

            <button
              onClick={() => handleNavClick("/home/bookmarks")}
              className="w-full flex items-center gap-4 px-4 py-4 text-white hover:bg-hover transition-colors"
            >
              <FaRegBookmark size={20} />
              <span className="text-lg">Bookmarks</span>
            </button>

            <button
              onClick={() => handleNavClick("/home/settings")}
              className="w-full flex items-center gap-4 px-4 py-4 text-white hover:bg-hover transition-colors"
            >
              <IoMdSettings size={20} />
              <span className="text-lg">Settings and privacy</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 text-white hover:bg-hover transition-colors"
            >
              <span className="text-lg">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
