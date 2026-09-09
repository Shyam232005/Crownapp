'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const HelpandSupport = () => {
    const [accountType, setAccountType] = useState('business'); // 'business' | 'ca'
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        // Business specific
        companyName: '',
        gstin: '',
        // CA specific
        caFirmName: '',
        icaiNumber: '',
        // Issue Details
        issueCategory: 'login_issue',
        priority: 'high',
        subject: '',
        description: '',
        affectedInvoiceOrVoucher: '',
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Generate simulated support ticket ID
        const randomTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        setTicketId(randomTicket);
        setSubmitted(true);
    };
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-4">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    Priority Owners &amp; CA Desk
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Help &amp; Problem Resolution
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Dedicated priority support for registered business enterprises and verified ICAI audit partners.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Support SLAs & Emergency Contact */}
                <div className="space-y-5 lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold text-slate-900">Support SLAs</h2>

                        <div className="text-xs text-slate-600 space-y-3">
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <span className="font-semibold text-slate-800">Critical / Filing Blockers:</span>
                                <p className="mt-0.5 text-[11px] text-emerald-800 font-medium">Response within 2 Hours</p>
                                <p className="text-[10px] text-slate-400">Login failures, tax audit deadlines, GSTR filing blocks.</p>
                            </div>

                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <span className="font-semibold text-slate-800">Standard Queries:</span>
                                <p className="mt-0.5 text-[11px] text-slate-700 font-medium">Within 6 Business Hours</p>
                                <p className="text-[10px] text-slate-400">Invoice mapping, client linking, general questions.</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-2">
                            <p className="font-semibold text-slate-800">Direct Desk Contacts:</p>
                            <p className="text-[11px] text-slate-500">Email: crownlivingecosystems@gmail.com</p>

                            <p className="text-[10px] text-slate-400">Gujarat Support Hub (9:00 AM – 8:00 PM IST)</p>
                        </div>
                    </div>

                    {/* Quick Login Links */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-xs text-slate-600 space-y-2.5">
                        <p className="font-semibold text-slate-800">Looking to sign in instead?</p>
                        <div className="flex flex-col gap-2 pt-1">
                            <Link
                                href="/login"
                                className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                            >
                                Business User Login →
                            </Link>
                            <Link
                                href="/calogin"
                                className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-cyan-800 hover:bg-slate-50 shadow-sm transition"
                            >
                                CA Auditor Login →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ticket Submission Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm lg:col-span-2">
                    {submitted ? (
                        <div className="py-10 text-center space-y-4">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-lg">
                                ✓
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Support Ticket Generated</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Your issue has been dispatched to our engineering and compliance desk. A dedicated ticket manager has been assigned.
                            </p>

                            <div className="mt-4 inline-block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-mono text-sm font-bold text-emerald-900">
                                Ticket ID: {ticketId}
                            </div>

                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left font-mono text-[11px] text-slate-600 space-y-1">
                                <div><span className="text-slate-400">Account Type:</span> {accountType === 'business' ? 'Registered Enterprise' : 'Registered Chartered Accountant'}</div>
                                <div><span className="text-slate-400">Reporter:</span> {formData.name} ({formData.email})</div>
                                <div><span className="text-slate-400">Category:</span> {formData.issueCategory}</div>
                                <div><span className="text-slate-400">Priority:</span> {formData.priority.toUpperCase()}</div>
                                <div><span className="text-slate-400">Subject:</span> {formData.subject}</div>
                            </div>

                            <div className="pt-4 flex justify-center gap-3">
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                                >
                                    Submit Another Ticket
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg border border-emerald-600/30 bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm"
                                >
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Account Type Toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    I am raising this particular problem: *
                                </label>
                                <div className="mt-2 flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setAccountType('business')}
                                        className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${accountType === 'business'
                                            ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                                            : 'border border-transparent text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        Registered Business / Enterprise
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccountType('ca')}
                                        className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${accountType === 'ca'
                                            ? 'border border-slate-300 bg-white text-slate-900 shadow-sm'
                                            : 'border border-transparent text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        Registered Chartered Accountant (CA)
                                    </button>
                                </div>
                            </div>

                            {/* Identity Verification Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Your Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="e.g. Rajesh Shah"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Registered Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="registered@company.com"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Registered Phone / WhatsApp *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+91 98250 00000"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                </div>

                                {/* Conditional Field: Business GSTIN vs CA ICAI Number */}
                                {accountType === 'business' ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">Company GSTIN *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.gstin}
                                            onChange={(e) => handleChange('gstin', e.target.value)}
                                            placeholder="24AAACG1234E1Z6"
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">ICAI Membership Number *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={formData.icaiNumber}
                                            onChange={(e) => handleChange('icaiNumber', e.target.value)}
                                            placeholder="e.g. 142850"
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Issue Categorization */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Issue Category *</label>
                                    <select
                                        value={formData.issueCategory}
                                        onChange={(e) => handleChange('issueCategory', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    >
                                        <option value="login_issue">Login / Password / OTP Authentication Issue</option>
                                        <option value="signup_verification">Signup / Onboarding / Verification Pending</option>
                                        <option value="ca_portal_access">CA Portal Access / Client Linking Error</option>
                                        <option value="invoice_ingestion">Invoice Upload / Smart Mapping Glitch</option>
                                        <option value="gstr_2b_discrepancy">GSTR-2B or ITC Discrepancy Error</option>
                                        <option value="ledger_imbalance">Ledger / Voucher / Trial Balance Inquiry</option>
                                        <option value="billing_subscription">Billing, Invoice, or Subscription Issue</option>
                                        <option value="other_technical">Other System or Technical Problem</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Severity / Priority *</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => handleChange('priority', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    >
                                        <option value="urgent">Urgent (Tax filing or payroll blocked)</option>
                                        <option value="high">High (Cannot approve bills or login)</option>
                                        <option value="normal">Normal (General inquiry or feature issue)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Subject & Description */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Subject / Brief Summary *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => handleChange('subject', e.target.value)}
                                        placeholder="e.g. OTP not delivering to registered mobile on Chrome browser"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Detailed Description of the Issue *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Please explain what happened, steps to reproduce the error, and any error message displayed on your screen..."
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Affected Invoice / Voucher # or Client Name (If applicable)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.affectedInvoiceOrVoucher}
                                        onChange={(e) => handleChange('affectedInvoiceOrVoucher', e.target.value)}
                                        placeholder="e.g. Bill #INV-2026-084 or Client: Crown Fabrics"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button with Light Border */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-xl border border-emerald-600/30 bg-emerald-700 py-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
                                >
                                    Submit Priority Support Ticket
                                </button>
                                <p className="mt-2 text-center text-[11px] text-slate-400">
                                    Tickets logged by verified CAs and active MSME clients are routed directly to our Gujarat engineering response team.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HelpandSupport
