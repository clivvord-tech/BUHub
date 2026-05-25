import React from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import TrendingHashtags from './TrendingHashtags'
import WhoToFollow from './WhoToFollow'

export default function RightSidebar() {
  return (
    <aside className='fixed right-0 top-0 w-[450px] p-5 h-screen pr-20 hidden xl:block'>
        <div className='text-white flex items-center gap-2 border border-border p-2 rounded-full bg-background'>
            <IoSearchOutline className='text-secondary-text'/>
            <input 
              type="text" 
              placeholder='Search (coming soon)' 
              className='outline-none w-full bg-transparent text-white placeholder-secondary-text cursor-not-allowed'
              disabled
            />
        </div>
        
        <div className='mt-5'>
          <TrendingHashtags />
        </div>

        <div className='mt-5'>
          <WhoToFollow />
        </div>

        <div className='border border-border p-4 text-white mt-5 rounded-lg opacity-60'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-bold text-xl'>Premium</h3>
              <span className='text-xs bg-border px-2 py-1 rounded'>Coming Soon</span>
            </div>
            <p className='text-secondary-text text-sm'>
              Subscribe to unlock exclusive features and support BinghamHub.
            </p>
        </div>

        <div className='border border-border p-4 text-white mt-5 rounded-lg opacity-60'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-bold text-xl'>Who to follow</h3>
              <span className='text-xs bg-border px-2 py-1 rounded'>Coming Soon</span>
            </div>
            <p className='text-secondary-text text-sm'>
              Discover and connect with other Bingham University students.
            </p>
        </div>

        <div className='border border-border p-4 text-white mt-5 rounded-lg'>
            <h3 className='font-bold text-xl mb-2'>Welcome to BinghamHub!</h3>
            <p className='text-secondary-text text-sm'>
              Connect with Bingham University students and staff. Share updates, engage with posts, and build your campus community.
            </p>
        </div>
    </aside>
  )
}
