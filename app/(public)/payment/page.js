"use client"
import React from 'react'
import {useRouter} from 'next/navigation'

const PaymentInterface = () => {
    const router = useRouter()
  return (
    <div>
      this is our payment interface <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 cursor-pointer" onClick={()=>{router.push("signup")}}>Click here to bypass</button>
    </div>
  )
}

export default PaymentInterface
