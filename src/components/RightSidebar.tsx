"use client";
import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IoSearchOutline } from 'react-icons/io5'
import { FaUser } from 'react-icons/fa6'
import { BiMessageSquareDetail } from 'react-icons/bi'
import TrendingHashtags from './TrendingHashtags'
import WhoToFollow from './WhoToFollow'
import OwnerBadge from './OwnerBadge'
import { searchAll, SearchResult } from '../../services/search'
import Image from 'next/image'

export default function RightSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        const results = await searchAll(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'user') {
      router.push(`/home/profile/${result.username}`);
    } else {
      router.push(`/home/post/${result.id}`);
    }
    setShowResults(false);
    setSearchQuery('');
  };
  
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

  // Welcome Panel Component (for homepage only)
  const WelcomePanel = () => (
    <div className='border border-border p-4 text-white mt-5 rounded-lg'>
      <h3 className='font-bold text-xl mb-3'>Welcome to BinghamHub!</h3>
      <p className='text-secondary-text text-sm'>
        Connect with Bingham University students. Share updates, engage with posts, and build your campus community.
      </p>
    </div>
  );

  return (
    <aside className='hidden xl:block absolute right-0 top-0 w-[350px] h-screen p-5 overflow-y-auto'>
        {/* Search Bar - Always visible */}
        <div ref={searchRef} className='relative'>
          <div className='text-white flex items-center gap-2 border border-border p-2 rounded-full bg-background focus-within:border-primary'>
              <IoSearchOutline className='text-secondary-text'/>
              <input 
                type="text" 
                placeholder='Search BinghamHub' 
                className='outline-none w-full bg-transparent text-white placeholder-secondary-text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
              />
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className='absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50'>
              {isSearching ? (
                <div className='p-4 text-center text-secondary-text'>Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className='p-3 hover:bg-hover cursor-pointer border-b border-border last:border-b-0 flex items-start gap-3'
                    >
                      {result.type === 'user' ? (
                        <>
                          <div className='relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                            {result.avatar_url ? (
                              <Image src={result.avatar_url} alt={result.name || ''} fill className='object-cover' />
                            ) : (
                              <div className='w-full h-full bg-border flex items-center justify-center'>
                                <FaUser className='text-secondary-text' />
                              </div>
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1'>
                              <span className='font-bold text-white truncate'>{result.name}</span>
                              <OwnerBadge isOwner={result.is_owner || false} size="sm" />
                            </div>
                            <div className='text-secondary-text text-sm truncate'>@{result.username}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <BiMessageSquareDetail className='text-secondary-text mt-1 flex-shrink-0' size={20} />
                          <div className='flex-1 min-w-0'>
                            <div className='text-white text-sm line-clamp-2'>{result.content}</div>
                            <div className='text-secondary-text text-xs mt-1'>by @{result.username}</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className='p-4 text-center text-secondary-text'>No results found</div>
              )}
            </div>
          )}
        </div>
        
        {/* HOME PAGE: Welcome + Today's News + What's happening + Who to follow */}
        {isHomePage && (
          <>
            <WelcomePanel />
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
