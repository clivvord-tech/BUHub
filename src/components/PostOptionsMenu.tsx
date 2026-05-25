"use client";
import { useState, useRef, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaTrash, FaUserPlus, FaVolumeXmark, FaBan, FaChartBar, FaCode, FaFlag } from "react-icons/fa6";
import { BsPinAngle } from "react-icons/bs";
import { useDeleteTweet } from "../../custom-hooks/useTweet";
import { useRouter } from "next/navigation";
import { pinPost } from "../../services/repost";

type PostOptionsMenuProps = {
  tweetId: string;
  creatorId: string;
  currentUserId?: string;
  imagePath?: string;
  isTweetPostViewPage?: boolean;
  creatorUsername?: string;
  isComment?: boolean;
  isPinned?: boolean;
};

export default function PostOptionsMenu({
  tweetId,
  creatorId,
  currentUserId,
  imagePath,
  isTweetPostViewPage = false,
  creatorUsername = "user",
  isComment = false,
  isPinned = false,
}: PostOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate } = useDeleteTweet();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = () => {
    if (!confirm("You're about to delete this post. Are you sure?")) {
      return;
    }

    mutate(
      {
        tweetId,
        imagePath: imagePath || undefined,
      },
      {
        onSuccess: () => {
          if (isTweetPostViewPage) {
            router.replace("/home");
          }
        },
      }
    );
    setIsOpen(false);
  };

  const handlePin = async () => {
    await pinPost(tweetId);
    setIsOpen(false);
    window.location.reload();
  };

  const isOwnPost = creatorId === currentUserId;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-secondary-text hover:text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
      >
        <BsThreeDots size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
          {isOwnPost ? (
            // Own post menu
            <>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaTrash size={16} />
                <span className="font-semibold">Delete</span>
              </button>
              {!isComment && (
                <button
                  onClick={handlePin}
                  className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
                >
                  <BsPinAngle size={16} />
                  <span className="font-semibold">{isPinned ? "Unpin from profile" : "Pin to your profile"}</span>
                </button>
              )}
              <button
                onClick={() => alert("View post activity - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaChartBar size={16} />
                <span className="font-semibold">View post activity</span>
              </button>
              <button
                onClick={() => alert("Embed post - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaCode size={16} />
                <span className="font-semibold">Embed post</span>
              </button>
            </>
          ) : isTweetPostViewPage ? (
            // Other's post on detail page (no delete)
            <>
              <button
                onClick={() => alert(`Follow @${creatorUsername} - Coming soon`)}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaUserPlus size={16} />
                <span className="font-semibold">Follow @{creatorUsername}</span>
              </button>
              <button
                onClick={() => alert(`Mute @${creatorUsername} - Coming soon`)}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaVolumeXmark size={16} />
                <span className="font-semibold">Mute</span>
              </button>
              <button
                onClick={() => alert("Mute this conversation - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaVolumeXmark size={16} />
                <span className="font-semibold">Mute this conversation</span>
              </button>
              <button
                onClick={() => alert(`Block @${creatorUsername} - Coming soon`)}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaBan size={16} />
                <span className="font-semibold">Block @{creatorUsername}</span>
              </button>
              <button
                onClick={() => alert("View post activity - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaChartBar size={16} />
                <span className="font-semibold">View post activity</span>
              </button>
              <button
                onClick={() => alert("Embed post - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaCode size={16} />
                <span className="font-semibold">Embed post</span>
              </button>
              <button
                onClick={() => alert("Report post - Coming soon")}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaFlag size={16} />
                <span className="font-semibold">Report post</span>
              </button>
            </>
          ) : (
            // Other's post on home page
            <>
              <button
                onClick={() => alert("Not interested - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <span className="font-semibold">Not interested in this post</span>
              </button>
              <button
                onClick={() => alert(`Follow @${creatorUsername} - Coming soon`)}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaUserPlus size={16} />
                <span className="font-semibold">Follow @{creatorUsername}</span>
              </button>
              <button
                onClick={() => alert(`Mute @${creatorUsername} - Coming soon`)}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaVolumeXmark size={16} />
                <span className="font-semibold">Mute</span>
              </button>
              <button
                onClick={() => alert(`Block @${creatorUsername} - Coming soon`)}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaBan size={16} />
                <span className="font-semibold">Block @{creatorUsername}</span>
              </button>
              <button
                onClick={() => alert("View post activity - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaChartBar size={16} />
                <span className="font-semibold">View post activity</span>
              </button>
              <button
                onClick={() => alert("Embed post - Coming soon")}
                className="w-full px-4 py-3 text-left text-white hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaCode size={16} />
                <span className="font-semibold">Embed post</span>
              </button>
              <button
                onClick={() => alert("Report post - Coming soon")}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-hover transition-colors flex items-center gap-3"
              >
                <FaFlag size={16} />
                <span className="font-semibold">Report post</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
