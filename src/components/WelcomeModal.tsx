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
          <p className="text-lg">Hey everyone! 👋</p>
          
          <p>
            I'm excited to have you here as we launch BinghamHub - our very own social network for Bingham University!
          </p>
          
          <p>
            I want to be transparent with you all: you'll notice that several features like Explore, Notifications, Messages, Communities, and Profile pages are marked as "Coming Soon." These features are currently locked as they're still under active development.
          </p>
          
          <div className="bg-hover p-4 rounded-lg">
            <p className="font-bold mb-2">What's working right now:</p>
            <ul className="space-y-1 text-sm">
              <li>✅ Creating posts with text and images</li>
              <li>✅ Liking and commenting on posts</li>
              <li>✅ Real-time feed with infinite scroll</li>
              <li>✅ Secure authentication for @binghamuni.edu.ng emails</li>
            </ul>
          </div>
          
          <div className="bg-hover p-4 rounded-lg">
            <p className="font-bold mb-2">What's coming soon:</p>
            <ul className="space-y-1 text-sm">
              <li>🔜 User profiles and profile pages</li>
              <li>🔜 Notifications system</li>
              <li>🔜 Direct messaging</li>
              <li>🔜 Explore and search functionality</li>
              <li>🔜 And much more!</li>
            </ul>
          </div>
          
          <p>
            I'm working hard to bring you the complete experience, and I appreciate your patience as we build this together. Your feedback during this early phase is invaluable!
          </p>
          
          <p>
            Feel free to test out the current features and let me know if you encounter any issues or have suggestions.
          </p>
          
          <p className="text-lg">Thank you for being part of this journey! 🚀</p>
          
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
