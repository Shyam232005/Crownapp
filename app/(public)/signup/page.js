'use client';
import React, { useState } from 'react'
import Link from 'next/link'

const SingUp = () => {
    const [accountType, setAccountType] = useState('business');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companyRole: 'founder',
        gstin: '',
        caFirmName: '',
        icaiNumber: '',
        cityState: '',
        referredBy: '',
        agreeTerms: true,
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match. Please re-enter.');
            return;
        }

        if (formData.password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData)
            })
        } catch (error) {
            setErrorMessage('An error occurred while signing up. Please try again.')
        }

        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false);
            setSignupSuccess(true);
        }, 700);
    };
    return (
        <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8">
            {/* Top Header */}
            <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
                <Link
                    href="/"
                    className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-emerald-800"
                >
                    Crown Ecosystems
                </Link>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Already registered?</span>
                    <Link
                        href="/login"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                        Sign In →
                    </Link>
                </div>
            </div>

            {/* Main Registration Card */}
            <div className="mx-auto w-full max-w-xl py-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                    {signupSuccess ? (
                        /* Success View */
                        <div className="py-8 text-center space-y-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-2xl font-bold">
                                ✓
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Workspace Account Created!
                            </h2>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Welcome aboard, <strong className="text-slate-800">{formData.fullName}</strong>. Your login credentials have been generated for{' '}
                                <strong className="text-slate-800">
                                    {accountType === 'business' ? formData.companyName || 'your enterprise' : formData.caFirmName || 'your CA practice'}
                                </strong>.
                            </p>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-left font-mono text-[11px] text-slate-600 space-y-1">
                                <div><span className="text-slate-400">Account Type:</span> {accountType === 'business' ? 'Business Enterprise & Team' : 'Chartered Accountant (CA Partner)'}</div>
                                <div><span className="text-slate-400">Login ID:</span> {formData.email}</div>
                                <div><span className="text-slate-400">Status:</span> Active (Verified Workspace)</div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-2.5">
                                <Link
                                    href={accountType === 'ca' ? '/ca-login' : '/login'}
                                    className="rounded-xl border border-emerald-600/30 bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm transition"
                                >
                                    Proceed to Login Portal →
                                </Link>
                                <Link
                                    href="/"
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
                                >
                                    Return to Home
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Signup Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Heading */}
                            <div className="text-center">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Create Your Account
                                </h1>
                                <p className="mt-1 text-xs text-slate-500">
                                    Select your role to set up your organization workspace and login credentials.
                                </p>
                            </div>

                            {/* Error Notification */}
                            {errorMessage && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-800">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Account Type Toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    I am creating an account for: *
                                </label>
                                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAccountType('business');
                                            setErrorMessage('');
                                        }}
                                        className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${accountType === 'business'
                                            ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                                            : 'border border-transparent text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        Business Owner &amp; Finance Team
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAccountType('ca');
                                            setErrorMessage('');
                                        }}
                                        className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${accountType === 'ca'
                                            ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                                            : 'border border-transparent text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        Chartered Accountant (CA)
                                    </button>
                                </div>
                            </div>

                            {/* 1. Identity & Contact Details */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-1.5">
                                    1. Contact &amp; Identity
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">
                                            {accountType === 'ca' ? 'CA Member Full Name *' : 'Full Name *'}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => handleChange('fullName', e.target.value)}
                                            placeholder={accountType === 'ca' ? 'CA. Rajesh Shah' : 'Rajesh Shah'}
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">Mobile Number (+91) *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="98250 00000"
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        {accountType === 'ca' ? 'Official CA Email Address *' : 'Official Work Email (Login ID) *'}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder={accountType === 'ca' ? 'rajesh@rshahca.com' : 'rajesh@company.com'}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                    <span className="text-[10px] text-slate-400">
                                        This email will serve as your primary credential ID for signing in.
                                    </span>
                                </div>
                            </div>

                            {/* 2. Organization / CA Practice Details */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-1.5">
                                    2. {accountType === 'business' ? 'Organization Profile' : 'CA Firm Credentials'}
                                </h3>

                                {accountType === 'business' ? (
                                    /* Business Fields */
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700">Company Legal Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.companyName}
                                                onChange={(e) => handleChange('companyName', e.target.value)}
                                                placeholder="e.g. Apex Precision Engineering LLP"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700">Your Role in Company *</label>
                                            <select
                                                value={formData.companyRole}
                                                onChange={(e) => handleChange('companyRole', e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            >
                                                <option value="founder">Business Owner / Managing Director</option>
                                                <option value="finance_head">CFO / Finance Head / VP Finance</option>
                                                <option value="accountant">Senior Accountant / Accounts Manager</option>
                                                <option value="operations">Operations / Factory Head</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700">Company GSTIN (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.gstin}
                                                onChange={(e) => handleChange('gstin', e.target.value)}
                                                placeholder="24AAACG1234E1Z6"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* CA Fields */
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700">CA Firm Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.caFirmName}
                                                onChange={(e) => handleChange('caFirmName', e.target.value)}
                                                placeholder="e.g. R. Shah &amp; Associates"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700">ICAI Membership Number (6 Digits) *</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={formData.icaiNumber}
                                                onChange={(e) => handleChange('icaiNumber', e.target.value)}
                                                placeholder="142850"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700">City / State *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.cityState}
                                                onChange={(e) => handleChange('cityState', e.target.value)}
                                                placeholder="Ahmedabad, Gujarat"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700">Referred By (Client or CA)</label>
                                            <input
                                                type="text"
                                                value={formData.referredBy}
                                                onChange={(e) => handleChange('referredBy', e.target.value)}
                                                placeholder="e.g. Crown Fabrics or Direct"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Security & Credentials Setup */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-1.5">
                                    3. Security Credentials
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">Create Password *</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-[10px] text-slate-500 hover:text-slate-700"
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">Confirm Password *</label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            placeholder="Re-enter password"
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    required
                                    checked={formData.agreeTerms}
                                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                />
                                <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-snug cursor-pointer">
                                    I agree to the <span className="text-slate-800 font-semibold">Terms of Service</span>,{' '}
                                    <span className="text-slate-800 font-semibold">Privacy Policy</span>, and statutory compliance protocols under the Indian Companies Act.
                                </label>
                            </div>

                            {/* Submit Button with Light Border */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl border border-emerald-600/30 bg-emerald-700 py-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
                            >
                                {isLoading
                                    ? 'Setting Up Your Workspace...'
                                    : accountType === 'ca'
                                        ? 'Create CA Auditor Credentials'
                                        : 'Create Business Account & Workspace'}
                            </button>
                        </form>
                    )}

                    {/* Footer Note */}
                    <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                        Already have an active workspace?{' '}
                        <Link
                            href={accountType === 'ca' ? '/ca-login' : '/login'}
                            className="font-semibold text-emerald-800 hover:underline"
                        >
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Security Assurance */}
            <div className="mx-auto w-full max-w-6xl text-center text-xs text-slate-400 space-y-1">
                <p>Enterprise 256-bit Encryption • Cloud Ledger Integrity • Strict Data Isolation</p>
                <p>© {new Date().getFullYear()} Crown Ecosystems Private Limited. All rights reserved.</p>
            </div>
        </div>
    );
}
export default SingUp
