"use client"
import { useRouter } from 'next/navigation'
import React from 'react'

const Payments = () => {
    const router = useRouter()
  return (
    <div>
      to by pass payments clikc here <button className='bg-red-300 hover:bg-green-300 cursor-pointer'onClick={()=>{router.push("signup")}} >By Pass Payments</button>
    </div>
  )
}

export default Payments
