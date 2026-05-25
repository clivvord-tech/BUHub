"use client";
import { useState, useRef, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaTrash } from "react-icons/fa6";
import { useDeleteTweet } from "../../custom-hooks/useTweet";
import { useRouter } from "next/navigation";

type PostOptionsMenuProps = {
  tweetId: string;
  creatorId: string;
  currentUserId?: string;
  imagePath?: string;
  isTweetPostViewPage?: boolean;
};

export default function PostOptionsMenu({
  tweetId,
  creatorId,
  currentUserId,
  imagePath,
  isTweetPostViewPage = false,
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

  const isOwnPost = creatorId === currentUserId;

  if (!isOwnPost) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-secondary-text hover:text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
      >
        <BsThreeDots size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 text-left text-red-500 hover:bg-hover transition-colors flex items-center gap-3"
          >
            <FaTrash size={16} />
            <span className="font-semibold">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
