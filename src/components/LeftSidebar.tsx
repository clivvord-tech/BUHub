import Link from 'next/link'
import React from 'react'
import { BiBell, BiEnvelope } from 'react-icons/bi'
import { BsPeople } from 'react-icons/bs'
import { FaRegUser } from 'react-icons/fa6'
import { GoHomeFill } from 'react-icons/go'
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi'
import { IoSearchOutline } from 'react-icons/io5'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import Profile from './Profile'
import LogoutButton from './LogoutButton'

export default function LeftSidebar() {
  return (
    <aside className='fixed left-0 top-0 w-[50px] lg:w-[400px] p-1 lg:p-4 h-screen lg:pl-30'>
        <div className='mb-6 text-primary flex items-center justify-center lg:justify-start'>
            <div className='font-bold text-2xl'>BH</div>
        </div>
        <div className='space-y-2'>
            <Link href="/home" className='text-white flex items-center lg:gap-3 p-3 rounded-full hover:bg-hover'>
              <GoHomeFill size={30}/>
              <span className='hidden lg:inline text-xl font-bold'>Home</span>
            </Link>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <IoSearchOutline size={30} />
              <span className='hidden lg:inline text-xl'>Explore</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <BiBell size={30} />
              <span className='hidden lg:inline text-xl'>Notifications</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <BiEnvelope size={30} />
              <span className='hidden lg:inline text-xl'>Messages</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <BsPeople size={30} />
              <span className='hidden lg:inline text-xl'>Communities</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <FaRegUser size={30} />
              <span className='hidden lg:inline text-xl'>Profile</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <RiVerifiedBadgeFill size={30} />
              <span className='hidden lg:inline text-xl'>Premium</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>

            <div className='text-secondary-text flex items-center lg:gap-3 p-3 rounded-full opacity-50 cursor-not-allowed' title='Coming Soon'>
              <HiOutlineDotsCircleHorizontal size={30} />
              <span className='hidden lg:inline text-xl'>More</span>
              <span className='hidden lg:inline text-xs ml-auto bg-border px-2 py-1 rounded'>Soon</span>
            </div>
        </div>
       <div className='absolute bottom-0 left-0 w-full p-4'>
         <LogoutButton/>
         <Profile/>
       </div>
    </aside>
  )
}
