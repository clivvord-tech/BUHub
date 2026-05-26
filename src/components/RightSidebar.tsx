"use client";
import React from 'react'
import { usePathname } from 'next/navigation'
import { IoSearchOutline } from 'react-icons/io5'
import TrendingHashtags from './TrendingHashtags'
import WhoToFollow from './WhoToFollow'

export default function RightSidebar() {
  const pathname = usePathname();
  
  // Determine page type
  const isHomePage = pathname === '/home' || pathname === '/';
  const isExplorePage = pathname?.startsWith('/home/explore');
  const isNotificationsPage = pathname?.startsWith('/home/notifications');
  const isBookmarksPage = pathname?.startsWith('/home/bookmarks');
  const isProfilePage = pathname?.startsWith('/home/profile');

  // What's Happening Panel Component
  const WhatsHappeningPanel = () => (
    <div className='border border-border p-4 text-white mt-5 rounded-lg'>
      <h3 className='font-bold text-xl mb-3'>What's happening</h3>
      <p className='text-secondary-text text-sm'>
        Stay updated with the latest from Bingham University community.
      </p>
    </div>
  );

  // Today's News Panel Component
  const TodaysNewsPanel = () => (
    <div className='border border-border p-4 text-white mt-5 rounded-lg'>
      <h3 className='font-bold text-xl mb-3'>Today's News</h3>
      <p className='text-secondary-text text-sm'>
        Trending topics and news from your campus.
      </p>
    </div>
  );

  // You Might Like Panel Component (for profile pages)
  const YouMightLikePanel = () => (
    <div className='border border-border p-4 text-white mt-5 rounded-lg'>
      <h3 className='font-bold text-xl mb-3'>You might like</h3>
      <p className='text-secondary-text text-sm'>
        Discover students and staff you might want to follow.
      </p>
    </div>
  );

  return (
    <aside className='hidden xl:block fixed right-0 top-0 w-[350px] h-screen p-5 overflow-y-auto'>
        {/* Search Bar - Always visible */}
        <div className='text-white flex items-center gap-2 border border-border p-2 rounded-full bg-background'>
            <IoSearchOutline className='text-secondary-text'/>
            <input 
              type="text" 
              placeholder='Search (coming soon)' 
              className='outline-none w-full bg-transparent text-white placeholder-secondary-text cursor-not-allowed'
              disabled
            />
        </div>
        
        {/* HOME PAGE: Today's News + What's happening + Who to follow */}
        {isHomePage && (
          <>
            <TodaysNewsPanel />
            <WhatsHappeningPanel />
            <div className='mt-5'>
              <WhoToFollow />
            </div>
          </>
        )}

        {/* EXPLORE PAGE: Today's News + Who to follow */}
        {isExplorePage && (
          <>
            <TodaysNewsPanel />
            <div className='mt-5'>
              <WhoToFollow />
            </div>
          </>
        )}

        {/* NOTIFICATIONS PAGE: What's happening + Who to follow */}
        {isNotificationsPage && (
          <>
            <WhatsHappeningPanel />
            <div className='mt-5'>
              <WhoToFollow />
            </div>
          </>
        )}

        {/* BOOKMARKS PAGE: What's happening + Who to follow */}
        {isBookmarksPage && (
          <>
            <WhatsHappeningPanel />
            <div className='mt-5'>
              <WhoToFollow />
            </div>
          </>
        )}

        {/* PROFILE PAGE: You might like + What's happening */}
        {isProfilePage && (
          <>
            <YouMightLikePanel />
            <WhatsHappeningPanel />
          </>
        )}

        {/* DEFAULT (Settings, etc.): Trending + Who to follow */}
        {!isHomePage && !isExplorePage && !isNotificationsPage && !isBookmarksPage && !isProfilePage && (
          <>
            <div className='mt-5'>
              <TrendingHashtags />
            </div>
            <div className='mt-5'>
              <WhoToFollow />
            </div>
          </>
        )}
    </aside>
  )
}
