"use client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { updateUserProfile } from "../../services/profile";
import { supabase } from "../../lib/SupabaseClient";
import Image from "next/image";
import { SpinnerCircularFixed } from "spinners-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    bio?: string;
    avatar_url: string;
  };
  onUpdate: () => void;
}

export default function EditProfileModal({ isOpen, onClose, profile, onUpdate }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const result = await updateUserProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl,
      });

      if (result.error) throw new Error(result.error);

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-xl w-full">
        <div className="border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit profile</h2>
          <button onClick={onClose} className="text-secondary-text hover:text-white transition-colors">
            <IoClose size={28} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Image
              src={avatarPreview}
              alt="Avatar"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
            <label className="cursor-pointer text-primary hover:underline text-sm">
              Change avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="text-secondary-text text-sm block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-background border border-border rounded-lg p-3 text-white outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-secondary-text text-sm block mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-white outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-secondary-text text-xs mt-1">{bio.length}/160</p>
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
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 rounded-full font-bold bg-primary text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <SpinnerCircularFixed size={16} color="#fff" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
