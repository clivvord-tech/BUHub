"use client";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">🎓 Welcome to BinghamHub!</h2>
          <button
            onClick={handleClose}
            className="text-secondary-text hover:text-white transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-white">
          <p className="text-lg">Welcome to BinghamHub! 👋</p>
          
          <p>
            Your exclusive social network for Bingham University students. Connect, share, and engage with your campus community.
          </p>
          
          <div className="bg-hover p-4 rounded-lg">
            <p className="font-bold mb-2">What you can do:</p>
            <ul className="space-y-1 text-sm">
              <li>✅ Create posts with text and images</li>
              <li>✅ Like and comment on posts</li>
              <li>✅ Follow other students and staff</li>
              <li>✅ Search for users and posts</li>
              <li>✅ Bookmark your favorite posts</li>
              <li>✅ Get real-time notifications</li>
            </ul>
          </div>
          
          <div className="bg-hover p-4 rounded-lg">
            <p className="font-bold mb-2">Coming soon:</p>
            <ul className="space-y-1 text-sm">
              <li>🔜 Direct messaging</li>
              <li>🔜 Communities and groups</li>
              <li>🔜 Premium features</li>
              <li>🔜 Enhanced explore page</li>
              <li>🔜 And much more!</li>
            </ul>
          </div>
          
          <p>
            Start by completing your profile, then dive into the feed to see what's happening on campus. Share your thoughts, connect with classmates, and be part of the conversation!
          </p>
          
          <div className="pt-4 border-t border-border">
            <p className="font-bold">- Nnamani Daniel</p>
            <p className="text-sm text-secondary-text">Founder, BinghamHub ★</p>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <button
            onClick={handleClose}
            className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-opacity-90 transition-all"
          >
            Got it, let's explore!
          </button>
        </div>
      </div>
    </div>
  );
}
