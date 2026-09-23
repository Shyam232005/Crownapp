'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const fadeDown = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

export default function WhoItsForPage() {
    return (
        <div className="relative w-full bg-[#FAFAFA] pb-24 pt-12 sm:pt-16 overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-24">

                {}
                <motion.section
                    className="text-center max-w-3xl mx-auto space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={fadeDown} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Tailored Stakeholder Workspaces
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        Who Is Crown Ecosystems Built For?
                    </motion.h1>
                    <motion.p variants={fadeUp} className="mx-auto text-lg leading-relaxed text-slate-600 sm:text-xl">
                        Founders, in-house accountants, and external CAs often have conflicting priorities. We bring all three onto a single, cooperative cloud platform—without forcing anyone to change their fundamental workflows.
                    </motion.p>
                </motion.section>

                {}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40"
                >
                    <div className="p-8 sm:p-12 lg:p-16">
                        {}
                        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-5">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-emerald-700">Persona 1: Executive Control</span>
                                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">MSME Founders & Directors</h2>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700">
                                <span className="text-emerald-600">🎯</span> Core Value: Peace of Mind & Cash Control
                            </div>
                        </motion.div>

                        {}
                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {}
                            <motion.div variants={fadeUp} className="rounded-3xl border border-rose-100 bg-rose-50/30 p-8 hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-rose-800 border-b border-rose-200/60 pb-4 mb-5">
                                    The Daily Frustrations
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Signing checks blind:</strong> Approving RTGS transfers or signing checks without knowing if the raw material actually arrived in the factory.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Duplicate payment leaks:</strong> Paying an invoice twice because the supplier sent it on WhatsApp and later submitted a physical bill.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>No remote visibility:</strong> Unable to know upcoming liabilities or bank balance while traveling, meeting clients, or visiting plants.</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {}
                            <motion.div variants={fadeUp} className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-200 pb-4 mb-5">
                                    How We Solve It
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-800">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Mobile-First Decision Cards:</strong> Review bills on your smartphone with a verified trust badge showing that delivery and PO rates match.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Duplicate Shield:</strong> The system automatically blocks duplicate invoice numbers from the same vendor.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Clear Cash Outflow:</strong> See total bills ready for payment, bills on hold, and upcoming due dates in one clean dashboard.</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>

                        {}
                        <motion.div variants={fadeUp} className="mt-8 rounded-2xl bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                                <svg className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">A Day in the Life</h4>
                            <p className="mt-3 text-base leading-relaxed text-slate-300 relative z-10 font-medium">
                                "You open the app on your phone at 10:00 AM. Three supplier bills are waiting for sign-off. Bill #1 is a regular steel delivery; the system displays a green badge: <span className="text-white bg-emerald-600/30 px-2 py-0.5 rounded">Matches Order & Delivery</span>. You tap <strong className="text-white">Approve</strong>. Bill #2 has a price discrepancy (billed ₹450 vs PO ₹410); you tap <strong className="text-white">Put on Hold</strong> with a quick voice-to-text note for your purchase manager. Total review time: under 2 minutes."
                            </p>
                        </motion.div>
                    </div>
                </motion.section>

                {}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40"
                >
                    <div className="p-8 sm:p-12 lg:p-16">
                        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-5">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zM12 8.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zM15.75 8.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-blue-700">Persona 2: Operations Team</span>
                                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">In-House Accounts & Finance</h2>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700">
                                <span className="text-blue-600">⚡</span> Core Value: Zero Data Entry & Clean Books
                            </div>
                        </motion.div>

                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <motion.div variants={fadeUp} className="rounded-3xl border border-rose-100 bg-rose-50/30 p-8 hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-rose-800 border-b border-rose-200/60 pb-4 mb-5">
                                    The Daily Frustrations
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Typing vouchers all day:</strong> Re-keying identical invoice data, vendor addresses, HSN codes, and tax values line by line.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Caught in the middle:</strong> Facing constant calls from vendors asking for payment status while waiting for the owner to sign paper slips.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Manual TDS & GST math:</strong> Calculating TDS u/s 194Q, 194C on calculators and manually splitting CGST/SGST.</span>
                                    </li>
                                </ul>
                            </motion.div>

                            <motion.div variants={fadeUp} className="rounded-3xl border border-blue-200 bg-blue-50/40 p-8 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-800 border-b border-blue-200 pb-4 mb-5">
                                    How We Solve It
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-800">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Forgiving Invoice Mapper:</strong> Drop in PDF bills or supplier Excel exports; the engine maps columns and auto-extracts data.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Automatic Tax Calculations:</strong> Built-in tax engines handle GST slab splits and automatically compute statutory TDS deductions.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Automated Voucher Creation:</strong> Approved bills automatically generate balanced purchase vouchers without re-typing.</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>

                        <motion.div variants={fadeUp} className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 text-slate-800 relative overflow-hidden group">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-700">A Day in the Life</h4>
                            <p className="mt-3 text-base leading-relaxed text-slate-600 relative z-10 font-medium">
                                "Instead of spending half your workday typing bills into an offline desktop software, you drag a batch of 15 supplier invoices into Crown Ecosystems. The system highlights 14 clean bills and flags 1 bill with an expired GSTIN. You review the mapped numbers, click <strong>Route to Approvals</strong>, and your work is done. You are free to focus on actual vendor reconciliation."
                            </p>
                        </motion.div>
                    </div>
                </motion.section>

                {}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40"
                >
                    <div className="p-8 sm:p-12 lg:p-16">
                        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-5">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-700 text-white shadow-md">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-purple-700">Persona 3: Statutory Audit</span>
                                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Chartered Accountants & Auditors</h2>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700">
                                <span className="text-purple-600">🛡️</span> Core Value: 100% Audit Readiness
                            </div>
                        </motion.div>

                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <motion.div variants={fadeUp} className="rounded-3xl border border-rose-100 bg-rose-50/30 p-8 hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-rose-800 border-b border-rose-200/60 pb-4 mb-5">
                                    The Daily Frustrations
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Corrupted backup files:</strong> Waiting until September for clients to send backup files, only to find missing entries and broken balances.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Section 43B(h) compliance traps:</strong> Discovering late payments to micro & small suppliers beyond 45 days, causing severe tax disallowances.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs mt-0.5">✕</span>
                                        <span><strong>Missing audit trails:</strong> MCA audit log requirements being breached because client software lacks an immutable edit log.</span>
                                    </li>
                                </ul>
                            </motion.div>

                            <motion.div variants={fadeUp} className="rounded-3xl border border-purple-200 bg-purple-50/40 p-8 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-purple-800 border-b border-purple-200 pb-4 mb-5">
                                    How We Solve It
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-800">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Free Dedicated CA Portal:</strong> Read-only workspace accessible year-round; no waiting for client backup zips.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Voucher-Level PDF Verification:</strong> Click any journal entry to inspect the original signed tax invoice PDF attached to the record.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-xs mt-0.5">✓</span>
                                        <span><strong>Statutory Tax Packs:</strong> Export Trial Balances, Creditors Ageing, and Section 44AB Tax Audit workbooks straight into Excel.</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>

                        <motion.div variants={fadeUp} className="mt-8 rounded-2xl bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden group">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-purple-400">A Day in the Life</h4>
                            <p className="mt-3 text-base leading-relaxed text-slate-300 relative z-10 font-medium">
                                "You log into your CA Auditor Portal in August, weeks ahead of the tax audit deadline. The General Ledger is mathematically balanced. You verify GSTR-2B Input Tax Credit matches with zero discrepancy, check that no MSME dues exceed 45 days, and download the full Section 44AB workbook formatted to ICAI standards. Zero stress, zero last-minute firefighting."
                            </p>
                        </motion.div>
                    </div>
                </motion.section>

                {}
                <motion.section
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 px-6 py-20 text-center shadow-2xl sm:px-12"
                >
                    {}
                    <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/20 blur-[120px] animate-pulse-soft"></div>

                    <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        A Single Platform Where Everyone Succeeds
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100/80">
                        The founder gets control over cash; the accounts executive is relieved of manual typing; and the Chartered Accountant receives mathematically balanced, audit-compliant books.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/demo/owner"
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30"
                        >
                            Experience Founder Approvals
                        </Link>
                        <Link
                            href="/demo/ca"
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-emerald-700 bg-emerald-900/50 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-800"
                        >
                            Explore CA Portal
                        </Link>
                        <Link
                            href="/purchase"
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-emerald-700 bg-emerald-900/50 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-800"
                        >
                            View Subscription Plans
                        </Link>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}