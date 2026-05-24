import CreatePost from '@/components/CreatePost'
import Posts from '@/components/Posts'
import WelcomeModal from '@/components/WelcomeModal'
import React from 'react'

export default function Page() {
  return (
    <div>
        <WelcomeModal />
        <div className='border border-border h-14 grid grid-cols-2 text-white'>
            <button className='font-semibold border-b-2 border-primary'>
                For You
            </button>
            <button className='font-semibold opacity-50 cursor-not-allowed' disabled title='Coming Soon'>
                Following
            </button>
        </div>
        <CreatePost/>
        <Posts/>
    </div>
  )
}
