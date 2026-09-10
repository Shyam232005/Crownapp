'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';

const CALogin = () => {
    const router = useRouter()

    const [loginMethod, setLoginMethod] = useState('membership'); // 'membership' | 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Form Fields
    const [membershipNo, setMembershipNo] = useState('');
    const [firmRegNo, setFirmRegNo] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    // Handle 6-box OTP input
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleSendOtp = (e) => {
        e.preventDefault();
        if (!mobileNumber) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setOtpSent(true);
        }, 600);
    };

    const handleca = async () => {
        try {
            const res = await fetch("/api/loginca", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ membershipNo, password })
            })

            if (res.ok) {
                return router.push("dashboard")
            } else {
                alert("User is not a member of crown ecosystems")
            }
        } catch (error) {
            alert("User is not a member of crown ecosystems")
        } finally {
            setMembershipNo('')
            setFirmRegNo('')
            setPassword('')
        }
    }


    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8">
            {/* Top Header */}
            <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
                <Link
                    href="/"
                    className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-emerald-800"
                >
                    Crown Ecosystems
                </Link>
                <Link
                    href="/login"
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                    ← Client / Business Sign In
                </Link>
            </div>

            {/* Main CA Portal Login Card */}
            <div className="mx-auto w-full max-w-md py-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                    {/* Badge & Title */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
                            <span className="h-2 w-2 rounded-full bg-cyan-600"></span>
                            ICAI Members &amp; Statutory Auditors
                        </div>
                        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            CA Auditor Portal Login
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Access your clients' verified ledgers, MCA edit logs, and Tax Audit packs.
                        </p>
                    </div>

                    {/* Login Type Tabs */}
                    <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod('membership');
                                setOtpSent(false);
                            }}
                            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${loginMethod === 'membership'
                                ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                                : 'border border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            ICAI Membership No.
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMethod('otp')}
                            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${loginMethod === 'otp'
                                ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                                : 'border border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Registered Mobile OTP
                        </button>
                    </div>

                    {/* METHOD 1: Membership Number + Password */}
                    {loginMethod === 'membership' && (
                        <form onSubmit={handleca} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    ICAI Membership Number (6 Digits) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={membershipNo}
                                    onChange={(e) => setMembershipNo(e.target.value)}
                                    placeholder="e.g. 142850"
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Firm Registration Number (FRN - Optional)
                                </label>
                                <input
                                    type="text"
                                    value={firmRegNo}
                                    onChange={(e) => setFirmRegNo(e.target.value)}
                                    placeholder="e.g. 012480W"
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Auditor Portal Password *
                                    </label>
                                    <Link
                                        href="/help"
                                        className="text-[11px] font-medium text-cyan-800 hover:underline"
                                    >
                                        Reset credentials?
                                    </Link>
                                </div>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your security password"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-cyan-600/30 bg-cyan-700 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:border-cyan-600 hover:bg-cyan-800 disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying ICAI Credentials...' : 'Sign In to Auditor Workspace'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* METHOD 2: Registered Mobile OTP */}
                    {loginMethod === 'otp' && (
                        <form onSubmit={otpSent ? handleLoginSubmit : handleSendOtp} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    ICAI Registered Mobile Number *
                                </label>
                                <div className="mt-1 flex rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-cyan-600">
                                    <span className="inline-flex items-center border-r border-slate-200 px-3 text-xs font-medium text-slate-500">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="98980 00000"
                                        disabled={otpSent}
                                        className="w-full rounded-r-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:bg-slate-50"
                                    />
                                </div>
                            </div>

                            {otpSent && (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Enter 6-Digit Verification OTP
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-[11px] font-medium text-cyan-800 hover:underline"
                                        >
                                            Change Number
                                        </button>
                                    </div>

                                    <div className="mt-2 flex justify-between gap-1.5">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(e.target, idx)}
                                                onFocus={(e) => e.target.select()}
                                                className="h-10 w-10 rounded-lg border border-slate-200 text-center font-mono text-sm font-bold text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        OTP sent to registered CA mobile number.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl border border-cyan-600/30 bg-cyan-700 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:border-cyan-600 hover:bg-cyan-800 disabled:opacity-50"
                            >
                                {isLoading
                                    ? 'Verifying...'
                                    : otpSent
                                        ? 'Authorize & Open Workspace'
                                        : 'Send Secure OTP'}
                            </button>
                        </form>
                    )}

                    {/* Quick Testing Helper */}
                    <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left text-[11px] text-slate-600">
                        <p className="font-semibold text-slate-800">Testing Credentials:</p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                            Membership No: <span className="text-slate-800 font-bold">142850</span> | Password: <span className="text-slate-800 font-bold">audit2026</span>
                        </p>
                    </div>

                    {/* Partner Registration Notice */}
                    <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                        Not yet registered as an audit partner?{' '}
                        <Link
                            href="/caregister"
                            className="font-semibold text-cyan-800 hover:underline"
                        >
                            Apply for CA Partner Access
                        </Link>
                    </div>
                </div>
            </div>

            {/* Statutory Privacy & Security Footer */}
            <div className="mx-auto w-full max-w-6xl text-center text-xs text-slate-400 space-y-1">
                <p>
                    Strictly Read-Only Access • Compliant with Section 143 of the Companies Act &amp; ICAI Code of Ethics
                </p>
                <p>© {new Date().getFullYear()} Crown Ecosystems Private Limited. All rights reserved.</p>
            </div>
        </div>
    )
}

export default CALogin
