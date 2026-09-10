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
      this is our dashboard {session.data?.user?.name}. <hr />
      <button onClick={() => signOut({callbackUrl: "/"})}>Logout</button>
    </div>
  )
}

export default Dashboard
