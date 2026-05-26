"use client";
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BiBell, BiEnvelope } from 'react-icons/bi'
import { BsPeople } from 'react-icons/bs'
import { FaRegUser, FaRegBookmark } from 'react-icons/fa6'
import { GoHomeFill } from 'react-icons/go'
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi'
import { IoSearchOutline } from 'react-icons/io5'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import { IoMdSettings } from 'react-icons/io'
import { IoStatsChart } from 'react-icons/io5'
import Profile from './Profile'
import BHLogo from './BHLogo'
import { useGetUser } from '../../custom-hooks/useGetUser'
import { getUnreadNotificationCount } from '../../services/notification'

export default function LeftSidebar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useGetUser();

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  return (
    <aside className='hidden lg:flex lg:flex-col absolute left-0 top-0 w-[275px] h-screen border-r border-border p-4'>
        <Link href="/home" className='mb-6 flex items-center lg:justify-start p-3'>
            <BHLogo size={50} showText={false} />
        </Link>
        <div className='space-y-2'>
            <Link href="/home" className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover'>
              <GoHomeFill size={26}/>
              <span className='hidden lg:inline text-xl font-bold'>Home</span>
            </Link>

            <Link href="/home/explore" className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover'>
              <IoSearchOutline size={26} />
              <span className='hidden lg:inline text-xl'>Explore</span>
            </Link>

            <Link href="/home/notifications" className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover relative'>
              <div className='relative'>
                <BiBell size={26} />
                {unreadCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className='hidden lg:inline text-xl'>Notifications</span>
            </Link>

            <div className="flex items-center gap-3 p-3 rounded-full hover:bg-hover text-gray-400 cursor-not-allowed">
              <BiEnvelope size={26} />
              <span className="hidden lg:inline text-xl">Messages</span>
              <span className="ml-auto bg-gray-700 text-xs px-2 py-0.5 rounded">Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <BsPeople size={26} />
              <span className='hidden lg:inline text-xl'>Communities</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <Link href={`/home/profile/${profile?.username || ''}`} className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover'>
              <FaRegUser size={26} />
              <span className='hidden lg:inline text-xl'>Profile</span>
            </Link>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <RiVerifiedBadgeFill size={26} />
              <span className='hidden lg:inline text-xl'>Premium</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <Link href="/home/bookmarks" className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover'>
              <FaRegBookmark size={26} />
              <span className='hidden lg:inline text-xl'>Bookmarks</span>
            </Link>

            <Link href="/home/settings" className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover'>
              <IoMdSettings size={26} />
              <span className='hidden lg:inline text-xl'>Settings</span>
            </Link>
        </div>
       <div className='absolute bottom-0 left-0 w-full p-4'>
         <Profile/>
       </div>
    </aside>
  )
}
