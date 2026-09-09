"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const Dashboard = () => {
    const router = useRouter()
    const session = useSession()
    console.log(session)
    
  return (
    <div>
      this is our dashboard {session.data?.user?.name}.
    </div>
  )
}

export default Dashboard
