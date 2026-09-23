"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'


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
        transition: { staggerChildren: 0.15 } // Delays each child by 0.15s
    }
};

const Main = () => {
    const [activeTab, setActiveTab] = useState('ingestion');
    return (
        <main className="relative w-full overflow-hidden">
            <section id="overview" className="relative border-b border-slate-200/60 bg-white px-4 pt-20 pb-24 sm:px-6 lg:pt-32 lg:pb-32">
                <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

                {/* We use staggerContainer here so all hero elements drop in one by one */}
                <motion.div
                    className="mx-auto max-w-5xl text-center"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={fadeDown} className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-100">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                        </span>
                        Universal Financial Operations for Growing MSMEs & CAs
                    </motion.div>

                    <motion.h1 variants={fadeUp} className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.15]">
                        Replace Outdated Desktop Ledgers with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">Cloud FinOps</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                        No more single-computer access locks or end-of-quarter auditing scrambles.
                        Crown Ecosystems unifies invoice capture, executive approvals, and balanced double-entry accounting.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/contact" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl">
                            Request a Product Demo
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                        <Link href="who" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
                            Explore Modules
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeUp} className="mx-auto mt-20 max-w-4xl rounded-2xl border border-slate-200/80 bg-white/60 p-2 shadow-sm backdrop-blur-lg sm:mt-24">
                        <div className="grid grid-cols-2 divide-y divide-slate-200/80 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                            {[
                                { title: 'Debit = Credit', sub: 'Always-balanced journals' },
                                { title: 'Zero Data Entry', sub: 'Automated invoice mapping' },
                                { title: 'Direct CA Portal', sub: 'Read-only audit workspace' },
                                { title: 'MCA Compliant', sub: 'Audit trail & GST ready' },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 sm:p-6 text-center">
                                    <p className="text-lg font-extrabold text-slate-900 sm:text-xl">{stat.title}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-500">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>
            <section id="stakeholders" className="bg-[#FAFAFA] py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700">Unified Architecture</h2>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Designed for the Entire Financial Ecosystem
                        </p>
                        <p className="mt-4 text-lg text-slate-600">
                            A single source of truth where stakeholders get exactly what they need, without the clutter of what they don't.
                        </p>
                    </motion.div>

                    {/* Staggering the 3 cards as you scroll to them */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="mt-16 grid gap-8 md:grid-cols-3"
                    >
                        {/* Card 1 */}
                        <motion.div variants={fadeUp} className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                </svg>
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">For Business Owners</div>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Total Cash Visibility</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 border-b border-slate-100 pb-5">
                                Stop waiting on manual reports. Know exactly what's in the bank and who needs to be paid.
                            </p>
                            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-start gap-2.5"><span className="text-emerald-500">✓</span> Swipe to approve payouts</li>
                                <li className="flex items-start gap-2.5"><span className="text-emerald-500">✓</span> Prevent duplicate vendor payments</li>
                                <li className="flex items-start gap-2.5"><span className="text-emerald-500">✓</span> Real-time cash flow forecasting</li>
                            </ul>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div variants={fadeUp} className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">For Finance Teams</div>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Zero Repetitive Typing</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 border-b border-slate-100 pb-5">
                                Free your workday from manual spreadsheet cleaning and re-entering vendor bills into offline systems.
                            </p>
                            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-start gap-2.5"><span className="text-blue-500">✓</span> Forgiving PDF & Excel ingestion</li>
                                <li className="flex items-start gap-2.5"><span className="text-blue-500">✓</span> Automated 3-Way PO Matching</li>
                                <li className="flex items-start gap-2.5"><span className="text-blue-500">✓</span> Instant GST & TDS calculation</li>
                            </ul>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div variants={fadeUp} className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider text-purple-700">For CAs & Auditors</div>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Audit-Ready Daily</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 border-b border-slate-100 pb-5">
                                Inspect mathematically balanced books with direct links to original bills and supporting docs.
                            </p>
                            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-start gap-2.5"><span className="text-purple-500">✓</span> Enforced Double-Entry journals</li>
                                <li className="flex items-start gap-2.5"><span className="text-purple-500">✓</span> Immutable MCA edit logs</li>
                                <li className="flex items-start gap-2.5"><span className="text-purple-500">✓</span> 1-click Trial Balance exports</li>
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            <section id="core-platform" className="border-t border-slate-200/60 bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Platform Capabilities</h2>
                        <p className="mt-4 text-lg text-slate-600">End-to-end financial operations from intake to balance sheet.</p>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="mt-10 flex justify-center"
                    >
                        <div className="inline-flex rounded-xl bg-slate-100 p-1.5 shadow-inner">
                            {[
                                { id: 'ingestion', label: '1. Smart Intake' },
                                { id: 'ledger', label: '2. Native Ledger' },
                                { id: 'portal', label: '3. CA Portal' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all sm:px-6 ${activeTab === tab.id
                                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tab Content Area */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
                        className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-xl lg:grid lg:grid-cols-2"
                    >
                        <div className="p-8 sm:p-12 lg:border-r lg:border-slate-200 lg:bg-white min-h-[400px]">
                            {/* AnimatePresence allows elements to animate OUT when they are unmounted! */}
                            <AnimatePresence mode="wait">
                                {activeTab === 'ingestion' && (
                                    <motion.div
                                        key="ingestion"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Forgiving Invoice Ingestion</h3>
                                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                                            Vendor invoices arrive in various formats: paper scans, WhatsApp images, and messy CSVs. Crown Ecosystems cleanses this data instantly, extracts GSTINs, and pre-fills your ledgers.
                                        </p>
                                        <ul className="mt-6 space-y-4 text-sm font-medium text-slate-700">
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Auto-Mapping for messy Excel files</li>
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Instant Tax ID (GSTIN/PAN) Verification</li>
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Mobile Kanban for Founder Approvals</li>
                                        </ul>
                                    </motion.div>
                                )}

                                {activeTab === 'ledger' && (
                                    <motion.div
                                        key="ledger"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Native Double-Entry Ledger</h3>
                                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                                            No third-party accounting sync required. When a bill is approved, the system mathematically generates perfect, standard-compliant journal entries instantly.
                                        </p>
                                        <ul className="mt-6 space-y-4 text-sm font-medium text-slate-700">
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Enforced Debit = Credit Equations</li>
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Real-Time Trial Balance updates</li>
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>One-click drill down to source PDF</li>
                                        </ul>
                                    </motion.div>
                                )}

                                {activeTab === 'portal' && (
                                    <motion.div
                                        key="portal"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Dedicated Auditor Workspace</h3>
                                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                                            Give your CA a specialized, read-only login. They can review vouchers, check compliance, and export clean audit schedules without touching operational data.
                                        </p>
                                        <ul className="mt-6 space-y-4 text-sm font-medium text-slate-700">
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Voucher-Level PDF Traceability</li>
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Statutory Schedule Exports (.xlsx)</li>
                                            <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Zero risk of accidental data deletion</li>
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* UI Preview Column */}
                        <div className="flex items-center justify-center p-6 sm:p-10 lg:bg-[#F8FAFC]">
                            {/* We still use CSS animate-float here because CSS is better for infinite looping animations than JS! */}
                            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 animate-float">
                                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                                </div>

                                <div className="p-5 font-mono text-xs">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'ingestion' && (
                                            <motion.div key="ingestion-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                                <div className="mb-4 flex items-center justify-between">
                                                    <span className="font-semibold text-slate-500">Invoice: INV-84</span>
                                                    <span className="rounded-md bg-emerald-100 px-2 py-1 font-bold text-emerald-800">GSTIN ACTIVE</span>
                                                </div>
                                                <div className="space-y-3 text-slate-700">
                                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span>Vendor</span><span className="font-semibold text-slate-900">Gujarat Precision</span></div>
                                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span>Taxable</span><span>₹1,50,000.00</span></div>
                                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span>CGST/SGST</span><span>₹27,000.00</span></div>
                                                    <div className="flex justify-between pt-1 text-sm font-bold text-slate-900"><span>Payable</span><span>₹1,77,000.00</span></div>
                                                </div>
                                            </motion.div>
                                        )}
                                        {activeTab === 'ledger' && (
                                            <motion.div key="ledger-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                                <div className="mb-4 flex items-center justify-between">
                                                    <span className="font-semibold text-slate-500">Voucher: JV-0922</span>
                                                    <span className="font-bold text-emerald-600">AUTO-POSTED</span>
                                                </div>
                                                <div className="space-y-3 text-slate-700">
                                                    <div className="flex justify-between"><span>Dr. Spares A/c</span><span className="font-semibold">₹1,50,000.00</span></div>
                                                    <div className="flex justify-between"><span>Dr. CGST A/c</span><span className="font-semibold">₹13,500.00</span></div>
                                                    <div className="flex justify-between"><span>Dr. SGST A/c</span><span className="font-semibold">₹13,500.00</span></div>
                                                    <div className="flex justify-between border-t border-slate-200 pt-3 text-slate-900"><span className="pl-4">Cr. Sundry Creditor</span><span className="font-bold">₹1,77,000.00</span></div>
                                                </div>
                                                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 py-2 text-center text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                                    Eq: Dr ₹1.77L = Cr ₹1.77L
                                                </div>
                                            </motion.div>
                                        )}
                                        {activeTab === 'portal' && (
                                            <motion.div key="portal-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                                <div className="mb-4 flex items-center justify-between">
                                                    <span className="font-semibold text-slate-500">Audit Space (FY27)</span>
                                                    <span className="rounded-md bg-slate-200 px-2 py-1 font-bold text-slate-700">READ ONLY</span>
                                                </div>
                                                <div className="space-y-3 text-slate-700">
                                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span>Total Vouchers</span><span className="font-bold text-slate-900">428</span></div>
                                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span>Balance Checks</span><span className="font-bold text-emerald-600">100% Passed</span></div>
                                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span>MSME 43B(h) Risk</span><span className="font-bold text-emerald-600">Clear</span></div>
                                                </div>
                                                <button className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-center text-xs font-bold text-white transition hover:bg-slate-800">
                                                    Download Trial Balance (.xlsx)
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <section id="contact" className="py-20 sm:py-32 overflow-hidden">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    {/* The CTA card slides up beautifully as it enters the screen */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="relative rounded-[2.5rem] bg-emerald-950 px-6 py-20 text-center shadow-2xl sm:px-12"
                    >
                        {/* CSS Pulse keeps the background breathing infinitely */}
                        <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/30 blur-[100px] animate-pulse-soft"></div>

                        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Bring Your Business and Auditors Onto One Secure Platform
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg text-emerald-100/80">
                            Experience strictly-balanced cloud FinOps, zero manual data entry, and an audit-ready CA portal.
                        </p>

                        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/contact" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-emerald-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30">
                                Book an MSME & CA Demo
                            </Link>
                            <Link href="overview" className="inline-flex items-center justify-center rounded-xl border border-emerald-700 bg-emerald-900/50 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-800">
                                Back to Overview
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}

export default Main
