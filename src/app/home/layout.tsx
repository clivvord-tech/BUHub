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
        <div className="mr-2 md:mr-10 xl:mr-110 lg:ml-100 ml-0 lg:ml-12 min-h-screen border-x border-border mb-16 lg:mb-0 mt-14 lg:mt-0">
          {children}
        </div>
        
        {/* Desktop Right Sidebar */}
        <RightSidebar />
      </QueryProvider>
    </>
  );
}
