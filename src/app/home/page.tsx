"use client";
import CreatePost from '@/components/CreatePost'
import Posts from '@/components/Posts'
import FollowingPosts from '@/components/FollowingPosts'
import WelcomeModal from '@/components/WelcomeModal'
import React, { useState } from 'react'

export default function Page() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');

  return (
    <div>
        <WelcomeModal />
        <div className='border border-border h-14 grid grid-cols-2 text-white'>
            <button 
              onClick={() => setActiveTab('forYou')}
              className={`font-semibold transition-colors ${
                activeTab === 'forYou' ? 'border-b-2 border-primary' : 'hover:bg-hover'
              }`}
            >
                For You
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`font-semibold transition-colors ${
                activeTab === 'following' ? 'border-b-2 border-primary' : 'hover:bg-hover'
              }`}
            >
                Following
            </button>
        </div>
        <CreatePost/>
        {activeTab === 'forYou' ? <Posts /> : <FollowingPosts />}
    </div>
  )
}
