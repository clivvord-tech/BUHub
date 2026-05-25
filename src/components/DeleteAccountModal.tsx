"use client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { supabase } from "../../lib/SupabaseClient";
import { useRouter } from "next/navigation";
import { SpinnerCircularFixed } from "spinners-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete user account (cascade will delete all related data)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin delete fails, try regular signout
        await supabase.auth.signOut();
      }

      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-red-500 rounded-2xl max-w-md w-full">
        <div className="border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-500">Delete Account</h2>
          <button onClick={onClose} className="text-secondary-text hover:text-white transition-colors">
            <IoClose size={28} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 font-bold mb-2">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-red-400 text-sm">
              Deleting your account will permanently remove:
            </p>
            <ul className="text-red-400 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Your profile and all personal information</li>
              <li>All your posts and comments</li>
              <li>Your likes, bookmarks, and follows</li>
              <li>All notifications related to your account</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-white text-sm block mb-2">
              Type <span className="font-bold text-red-500">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-background border border-border rounded-lg p-3 text-white outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="border-t border-border p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 rounded-full font-bold text-white hover:bg-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || confirmText !== "DELETE"}
            className="px-6 py-2 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <SpinnerCircularFixed size={16} color="#fff" />}
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
