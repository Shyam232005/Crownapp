"use client"
import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'

const SignUp = () => {
    const router = useRouter()
  return (
    <div>
      thsi is singup page <button className='bg-red-300 hover:bg-green-300 cursor-pointer'onClick={()=>{router.push("login")}}>Click here for login</button>
    </div>
  )
}

export default SignUp
