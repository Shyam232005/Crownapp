"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const Login = () => {
    const router = useRouter()
  return (
    <div>
      this is login page 
      <ul>
        <li onClick={()=>{router.push("owner")}}>Onwer</li>
        <li onClick={()=>{router.push("employee")}}>Employee</li>
        <li onClick={()=>{router.push("ca")}}>CA</li>
        <li onClick={()=>{router.push("ca-staff")}}>CA staff</li>
      </ul>
    </div>
  )
}

export default Login
