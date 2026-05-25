"use client";
import Image from "next/image";
import { IoClose } from "react-icons/io5";

type ImageViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  name: string;
};

export default function ImageViewer({ isOpen, onClose, imageUrl, name }: ImageViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
      >
        <IoClose size={32} />
      </button>
      <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imageUrl}
          alt={name}
          width={800}
          height={800}
          className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
