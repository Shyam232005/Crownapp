"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const Login = () => {
    const router = useRouter()
  return (
    <div>
      this is login page 
      <ul>
        <li onClick={()=>{router.push("owner/dashboard")}}>Onwer</li>
        <li onClick={()=>{router.push("/employee/dashboard")}}>Employee</li>
        <li onClick={()=>{router.push("ca/dashboard")}}>CA</li>
        <li onClick={()=>{router.push("ca-staff/dashboard")}}>CA staff</li>
      </ul>
    </div>
  )
}

export default Login
