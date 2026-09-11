'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';

const Login = () => {
  const router = useRouter()

  const handlesumbited = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/loginuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (res.ok) {
        return router.push("dashboard")
      }
    } catch (error) {
      alert("User is not a member of crown ecosystems")
    } finally {
      setEmail('')
      setPassword('')
    }
  }

  const [authMethod, setAuthMethod] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [rememberMe, setRememberMe] = useState(true);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/dashboard';
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      { }
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-emerald-700"
        >
          Crown Ecosystems
        </Link>
        <Link
          href="/calogin"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          CA Auditor Login →
        </Link>
      </div>

      { }
      <div className="mx-auto w-full max-w-md py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          { }
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Sign in to your account
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Access your MSME FinOps dashboard, live ledgers, and payout approvals.
            </p>
          </div>

          { }
          <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setOtpSent(false);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${authMethod === 'password'
                ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                : 'border border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${authMethod === 'otp'
                ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                : 'border border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Mobile OTP (Instant)
            </button>
          </div>

          { }
          {authMethod === 'password' && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Registered  Email
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/help"
                    className="text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="text-xs text-slate-600">Keep me logged in on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                onClick={handlesumbited}
                className="w-full rounded-xl border border-emerald-600/30 bg-emerald-700 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:border-emerald-600 hover:bg-emerald-800 disabled:opacity-50"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}
              </button>
            </form>
          )}

          { }
          {authMethod === 'otp' && (
            <form onSubmit={otpSent ? handleSubmit : handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Registered Mobile Number
                </label>
                <div className="mt-1 flex rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-emerald-600">
                  <span className="inline-flex items-center border-r border-slate-200 px-3 text-xs font-medium text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="98250 00000"
                    disabled={otpSent}
                    className="w-full rounded-r-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] font-medium text-emerald-700 hover:underline"
                    >
                      Change Number
                    </button>
                  </div>

                  { }
                  <div className="mt-2 flex justify-between gap-1.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target, idx)}
                        onFocus={(e) => e.target.select()}
                        className="h-10 w-10 rounded-lg border border-slate-200 text-center font-mono text-sm font-bold text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    OTP sent via SMS &amp; WhatsApp. Valid for 10 minutes.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl border border-emerald-600/30 bg-emerald-700 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:border-emerald-600 hover:bg-emerald-800 disabled:opacity-50"
              >
                {isLoading
                  ? 'Processing...'
                  : otpSent
                    ? 'Verify OTP & Log In'
                    : 'Send One-Time Password'}
              </button>
            </form>
          )}


          { }
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Don’t have a company workspace yet?{' '}
            <Link
              href="/purchase"
              className="font-semibold text-emerald-800 hover:underline"
            >
              Get started here
            </Link>
          </div>
        </div>
      </div>

      { }
      <div className="mx-auto w-full max-w-6xl text-center text-xs text-slate-400 space-y-1">
        <p>Protected by 256-bit SSL encryption • Compliant with MCA Audit Trail &amp; Indian Data Guidelines</p>
        <p>© {new Date().getFullYear()} Crown Ecosystems Private Limited. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Login