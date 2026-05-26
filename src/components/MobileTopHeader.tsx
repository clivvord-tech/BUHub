"use client";
import Image from "next/image";
import BHLogo from "./BHLogo";
import { useGetUser } from "../../custom-hooks/useGetUser";
import { SpinnerCircularFixed } from "spinners-react";

type MobileTopHeaderProps = {
  onProfileClick: () => void;
};

export default function MobileTopHeader({ onProfileClick }: MobileTopHeaderProps) {
  const { profile, loading } = useGetUser();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-40 h-14">
      <div className="flex items-center justify-between px-4 h-full">
        <button onClick={onProfileClick} className="w-8 h-8 rounded-full overflow-hidden">
          {loading ? (
            <div className="w-8 h-8 bg-hover rounded-full flex items-center justify-center">
              <SpinnerCircularFixed size={16} color="#1DA1F2" />
            </div>
          ) : profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Profile"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : null}
        </button>
        
        <div className="flex items-center justify-center">
          <BHLogo size={40} showText={false} />
        </div>
        
        <div className="w-8"></div>
      </div>
    </header>
  );
}
