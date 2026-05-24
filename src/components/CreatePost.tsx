"use client";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { FaRegFaceSmile } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { TbPhoto } from "react-icons/tb";
import { useGetUser } from "../../custom-hooks/useGetUser";
import { usePostTweet } from "../../custom-hooks/useTweet";
import { SpinnerCircularFixed } from "spinners-react";

export default function CreatePost() {
  const [post, setPost] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tweetImage, setTweetImage] = useState<null | File>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileref = useRef<HTMLInputElement | null>(null);
  const isDisabled = post.trim() === "" && !imagePreview;
  const { loading, session, profile, gettingSession } = useGetUser();
  const { mutate, isPending, error } = usePostTweet();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image must be less than 10MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Only image files are allowed");
      return;
    }

    setErrorMessage("");
    setImagePreview(URL.createObjectURL(file));
    setTweetImage(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileref.current) fileref.current.value = "";
    setTweetImage(null);
    setErrorMessage("");
  };

  const onEmojiClick = (emojidata: EmojiClickData) => {
    setPost((prev) => prev + emojidata.emoji);
  };

  const PostTweet = () => {
    if (!post.trim() && !tweetImage) {
      setErrorMessage("Post must contain text or an image");
      return;
    }

    if (!session?.user.id) {
      setErrorMessage("Please sign in first");
      return;
    }

    setErrorMessage("");

    mutate(
      {
        userId: session.user.id,
        content: post || null,
        tweetImage: tweetImage || null,
      },
      {
        onSuccess: () => {
          setPost("");
          setImagePreview(null);
          setTweetImage(null);
          setErrorMessage("");
        },
        onError: (err: any) => {
          const errorMsg = err?.message || "Failed to post. Please try again.";
          setErrorMessage(errorMsg);
        },
      }
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-4">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  if (gettingSession)
    return (
      <div className="flex justify-center items-center py-4">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  if (!session) return null;
  if (!profile) return null;

  return (
    <div
      className={`flex gap-4 p-4 border border-border ${
        isPending ? "opacity-50" : ""
      }`}
    >
      {profile?.avatar_url && (
        <Image
          src={profile.avatar_url}
          alt="profile-pic"
          width={500}
          height={500}
          className="w-10 h-10 object-cover rounded-full shrink-0"
        />
      )}
      <div className="w-full">
        <textarea
          placeholder="what's happening?"
          value={post}
          onChange={(e) => {
            setPost(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          maxLength={280}
          className="w-full placeholder:text-secondary-text outline-none text-xl resize-none text-white bg-background focus:outline-none"
        />
        <div className="text-xs text-secondary-text mb-2">
          {post.length}/280
        </div>

        {errorMessage && (
          <div className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-2 rounded-lg text-sm mb-4">
            {errorMessage}
          </div>
        )}

        {imagePreview && (
          <div className="h-60 md:h-100 rounded-lg overflow-hidden border border-border mb-4 relative">
            <Image
              src={imagePreview}
              width={500}
              height={500}
              className="h-full w-full object-cover"
              alt="preview-image"
            />
            <button
              className="absolute top-5 right-5 bg-gray-600 w-10 h-10 text-2xl rounded-full opacity-50 cursor-pointer grid place-items-center hover:opacity-100 transition-opacity"
              onClick={removeImage}
            >
              <RxCross2 />
            </button>
          </div>
        )}

        <div className="flex justify-between py-4 items-center border-t border-border">
          <div className="flex gap-3">
            <div
              className="text-primary cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => fileref.current?.click()}
              title="Add image"
            >
              <TbPhoto size={20} />
            </div>
            <div
              className="text-primary cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => setShowPicker(!showPicker)}
              title="Add emoji"
            >
              <FaRegFaceSmile size={20} />
            </div>
            <div
              className="text-primary cursor-pointer opacity-50"
              title="Coming soon"
            >
              <IoLocationOutline size={20} />
            </div>
            <div
              className="text-primary cursor-pointer opacity-50"
              title="Coming soon"
            >
              <RiCalendarScheduleLine size={20} />
            </div>
          </div>

          {isDisabled ? (
            <button
              disabled
              className="text-black bg-secondary-text py-2 px-5 font-semibold cursor-not-allowed rounded-full opacity-50"
            >
              Post
            </button>
          ) : (
            <button
              onClick={PostTweet}
              disabled={isPending}
              className="text-black bg-white py-2 px-5 font-semibold cursor-pointer rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          )}
        </div>

        {showPicker && (
          <div className="mt-4 border border-border rounded-lg p-2">
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={onEmojiClick}
              style={{
                width: "100%",
              }}
            />
          </div>
        )}

        <input
          type="file"
          ref={fileref}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
    </div>
  );
}