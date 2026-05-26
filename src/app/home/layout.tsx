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
        {/* Desktop Sidebar */}
        <LeftSidebar />
        
        {/* Mobile Components */}
        <MobileTopHeader onProfileClick={() => setIsMobileDrawerOpen(true)} />
        <MobileSideDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
        <MobileBottomNav />
        
        {/* Main Content */}
        <div className="w-full lg:w-auto lg:ml-100 min-h-screen border-x border-border mb-16 lg:mb-0 mt-14 lg:mt-0">
          {children}
        </div>
        
        {/* Desktop Right Sidebar */}
        <RightSidebar />
      </QueryProvider>
    </>
  );
}
