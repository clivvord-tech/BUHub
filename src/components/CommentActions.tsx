"use client";
import {
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
  FaTrash,
} from "react-icons/fa6";
import { IoIosStats } from "react-icons/io";
import { useUserSession } from "../../custom-hooks/useUserSession";
import { useDeleteComment } from "../../custom-hooks/useComment";

type CommentActionsProps = {
  creatorId: string;
  tweetId:string,
  commentId:string
};

export default function CommentActions({ creatorId,commentId,tweetId }: CommentActionsProps) {
  const { session } = useUserSession();
  const userId = session?.user.id;
  const {mutate} = useDeleteComment();

  const handleDelete = () => {
    mutate({
        tweetId,
        commentId
    })
  }
  return (
    <div className="flex justify-between my-4">
      {userId === creatorId && (
        <button onClick={handleDelete} className="text-red-700 flex items-center gap-1 cursor-pointer">
          <FaTrash />
        </button>
      )}
    </div>
  );
}
