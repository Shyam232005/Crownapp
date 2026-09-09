"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LNavbar = () => {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const handleall = () => {
        setMobileMenuOpen(!mobileMenuOpen)
        router.push("login")
    }
    const handleallca = ()=>{
        setMobileMenuOpen(!mobileMenuOpen)
        router.push("calogin")
    }
    const handleuser = () => {
        router.push("login")
    }
    const handleitsafe = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }
    const handlecaport = ()=>{
        router.push("calogin")
    }
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Text-Only Logo */}
                <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight text-gray-500 transition hover:text-black hover:shadow-[0_0_20px_theme('colors.gray.400')] rounded-2xl transition duration-300"
                >
                    Crown Ecosystems
                </Link>

                {/* Centered Desktop Navigation */}
                <nav className="hidden items-center gap-1 md:flex">
                    <Link
                        href="overview"
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        Overview
                    </Link>
                    <Link
                        href="who"
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        Who It’s For
                    </Link>
                    <Link
                        href="benefits"
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        Platform Benifits
                    </Link>
                    <Link
                        href="contact"
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        Contact Us
                    </Link>
                    <Link
                        href="help"
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        Help
                    </Link>
                </nav>

                {/* Right Action Buttons with Light Borders */}
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href="caregister"
                        className="rounded-lg border border-emerald-600/30 text-black px-4 py-1.5 text-sm font-medium hover:text-white shadow-sm transition hover:border-emerald-600 hover:bg-emerald-800 cursor-pointer hover:scale-110 duration-1000"
                    >
                        CA Registration
                    </Link>
                    <Link
                        href="purchase"
                        className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_0_20px_theme(colors.emerald.600)] cursor-pointer duration-1000"
                    >
                        Purchase Software
                    </Link>
                    <button
                        onClick={handleuser}
                        className="rounded-lg border border-emerald-600/30 text-black px-4 py-1.5 text-sm font-medium hover:text-white shadow-sm transition hover:border-emerald-600 hover:bg-emerald-800 cursor-pointer hover:scale-110 duration-1000"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={handlecaport}
                        className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_0_20px_theme(colors.emerald.600)] cursor-pointer duration-1000"
                    >
                        CA Auditor Portal
                    </button>
                </div>

                {/* Mobile Menu Button with Light Border */}
                <div className="flex md:hidden">
                    <button
                        onClick={handleitsafe}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Toggle navigation menu"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="border-b border-slate-200 bg-white px-4 pb-5 pt-3 md:hidden">
                    <nav className="flex flex-col space-y-1">
                        <Link
                            href="overview"
                            onClick={handleall}
                            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                        >
                            Overview
                        </Link>
                        <Link
                            href="who"
                            onClick={handleall}
                            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                        >
                            Who It’s For
                        </Link>
                        <Link
                            href="benefits"
                            onClick={handleall}
                            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                        >
                            Platform Benefits
                        </Link>
                        <Link
                            href="contact"
                            onClick={handleall}
                            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="help"
                            onClick={handleall}
                            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                        >
                            Help
                        </Link>
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                            <Link
                                href="caregister"
                                onClick={handleall}
                                className="w-full rounded-lg border border-emerald-600/30 bg-emerald-700 py-2 text-center text-sm font-medium text-white hover:bg-emerald-800 cursor-pointer"
                            >
                                CA Registration
                            </Link>
                            <Link
                                href="purchase"
                                onClick={handleall}
                                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_0_20px_theme(colors.emerald.600)] cursor-pointer duration-1000"
                            >
                                Purchase Software
                            </Link>
                            <button
                                onClick={handleall}
                                className="w-full rounded-lg border border-emerald-600/30 bg-emerald-700 py-2 text-center text-sm font-medium text-white hover:bg-emerald-800 cursor-pointer"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleallca}
                                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_0_20px_theme(colors.emerald.600)] cursor-pointer duration-1000"
                            >
                                CA Auditor Portal
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}

export default LNavbar
