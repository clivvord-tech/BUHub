"use client";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileTopHeader from "@/components/MobileTopHeader";
import MobileSideDrawer from "@/components/MobileSideDrawer";
import React, { useState } from "react";
import QueryProvider from "../../../providers/QueryProviders";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <>
      <QueryProvider>
        {/* Mobile Components */}
        <MobileTopHeader onProfileClick={() => setIsMobileDrawerOpen(true)} />
        <MobileSideDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
        <MobileBottomNav />
        
        {/* Centered Container Wrapper - Matches X's centered layout */}
        <div className="max-w-[1280px] mx-auto px-0 lg:px-0">
          {/* Desktop Layout Container */}
          <div className="flex min-h-screen relative">
            {/* Left Sidebar - Hidden on mobile */}
            <LeftSidebar />
            
            {/* Main Content - Full width on mobile, constrained on desktop */}
            <main className="flex-1 min-h-screen border-x border-border mb-16 lg:mb-0 mt-14 lg:mt-0 lg:ml-[275px] xl:mr-[350px]">
              {children}
            </main>
            
            {/* Right Sidebar - Hidden on mobile and tablet */}
            <RightSidebar />
          </div>
        </div>
      </QueryProvider>
    </>
  );
}
