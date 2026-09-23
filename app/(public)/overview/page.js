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

export default function OverviewPage() {
    return (
        <div className="relative w-full bg-[#FAFAFA] pb-24 pt-12 sm:pt-16 overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-20">

                {}
                <motion.section
                    className="text-center max-w-4xl mx-auto space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={fadeDown} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                        </span>
                        Comprehensive Product Guide
                    </motion.div>

                    <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        What is Crown Ecosystems?
                    </motion.h1>

                    <motion.p variants={fadeUp} className="mx-auto text-lg leading-relaxed text-slate-600 sm:text-xl max-w-3xl">
                        A standalone, cloud-native Financial Operations (FinOps) and Core ERP platform designed specifically for Indian MSMEs. We bridge the gap between daily operations and statutory accounting, replacing fragile desktop packages and complex foreign software.
                    </motion.p>
                </motion.section>

                {}
                <motion.section
                    className="relative"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={fadeUp} className="text-center mb-10">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">The Ground Reality</h2>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Why Indian MSMEs Struggle with Cash Outflow</h3>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {}
                        <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-b from-white to-rose-50/50 p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">Crisis 1: The "Dirty Data" Leak</h4>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Vendor bills arrive via WhatsApp, skewed PDFs, and handwritten challans. Because data is manually re-typed:
                            </p>
                            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-start gap-3"><span className="text-rose-500 font-bold">✕</span> Invoices get paid twice due to typos.</li>
                                <li className="flex items-start gap-3"><span className="text-rose-500 font-bold">✕</span> Vendors bill higher rates than the PO.</li>
                                <li className="flex items-start gap-3"><span className="text-rose-500 font-bold">✕</span> Ineligible GST input tax credits (ITC) trigger notices and 18% penalties.</li>
                            </ul>
                        </motion.div>

                        {}
                        <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-b from-white to-amber-50/50 p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">Crisis 2: The Desktop Bottleneck</h4>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Accounts departments rely on legacy software installed on a single office PC:
                            </p>
                            <ul className="mt-5 space-y-3 text-sm font-medium text-slate-700">
                                <li className="flex items-start gap-3"><span className="text-amber-500 font-bold">✕</span> Founders cannot approve bills when traveling.</li>
                                <li className="flex items-start gap-3"><span className="text-amber-500 font-bold">✕</span> Data corrupts during power cuts or updates.</li>
                                <li className="flex items-start gap-3"><span className="text-amber-500 font-bold">✕</span> CAs receive data only at year-end, causing massive tax-filing scrambles.</li>
                            </ul>
                        </motion.div>
                    </div>
                </motion.section>

                {}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={fadeUp} className="text-center mb-12">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700">The Solution</h2>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">From Vendor Invoice to Audit-Ready Ledger</h3>
                        <p className="mt-3 text-lg text-slate-600">Every step is automated to eliminate data entry while maintaining rigorous checks.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {[
                            {
                                step: "01",
                                title: "Smart Intake & Data Cleansing",
                                desc: "Upload bills in any format. The system reads vendor names, GSTINs, line items, and tax rates. It automatically verifies GSTIN status and ensures tax math (CGST + SGST) adds up correctly.",
                                benefit: "No manual voucher typing; duplicate bills caught instantly."
                            },
                            {
                                step: "02",
                                title: "Automated 3-Way Matching",
                                desc: "Before approval, the system compares the Purchase Order (PO), Goods Receipt Note (GRN), and Vendor Tax Invoice. Any discrepancy in rates or quantities is immediately flagged.",
                                benefit: "You never overpay for unreceived goods or unauthorized rate increases."
                            },
                            {
                                step: "03",
                                title: "Mobile Payout Decision Board",
                                desc: "Founders see clean summary cards on their phones showing Vendor Name, Amount, Due Date, and Trust Badges. Approve, Hold, or Reject with one tap.",
                                benefit: "Control company cash flow from anywhere, without paper files."
                            },
                            {
                                step: "04",
                                title: "Native Ledger & Live CA Audit",
                                desc: "Upon approval, the system instantly generates a strictly balanced double-entry journal (Debits = Credits). Your GL and Trial Balance update in real-time for your CA.",
                                benefit: "Full MCA-compliant audit trail with original PDF attachments."
                            }
                        ].map((item, index) => (
                            <motion.div variants={fadeUp} key={index} className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                <div className="absolute top-6 right-8 text-6xl font-black text-slate-50">{item.step}</div>
                                <div className="relative z-10">
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white mb-4">
                                        {item.step}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{item.title}</h4>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                                    <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                                        <p className="text-sm font-medium text-emerald-900">
                                            <span className="font-bold">Result:</span> {item.benefit}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={fadeUp} className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900">Architectural Comparison</h2>
                    </motion.div>

                    <motion.div variants={fadeUp} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-5 font-bold text-slate-900 border-b border-slate-200">Capability</th>
                                        <th className="p-5 font-bold text-slate-500 border-b border-slate-200">Legacy Desktop Accounting</th>
                                        <th className="p-5 font-bold text-slate-500 border-b border-slate-200">Foreign Enterprise ERPs</th>
                                        <th className="p-5 font-bold text-emerald-800 bg-emerald-50/50 border-b border-emerald-100">Crown Ecosystems</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        ['Platform Access', 'Single office PC; no mobile', 'Complex Web/Cloud', '100% Cloud; Mobile-native'],
                                        ['Bill Ingestion', '100% manual typing', 'Requires expensive plugins', 'Built-in smart PDF/CSV intake'],
                                        ['Order Matching', 'Manual paper comparison', 'Rigid; requires full-time operator', 'Automated 3-way match'],
                                        ['Indian Statutory', 'Basic; manual 2B matching', 'Poorly configured for GST/TDS', 'Native 43B(h), 194Q & 2B ITC'],
                                        ['Audit Trail', 'Can be disabled or corrupted', 'Complex, costly add-on', 'Built-in immutable MCA log'],
                                        ['CA Access', 'Zip files emailed at year-end', 'Requires extra paid licenses', 'Free, dedicated CA Portal']
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5 font-semibold text-slate-900">{row[0]}</td>
                                            <td className="p-5 text-slate-600">{row[1]}</td>
                                            <td className="p-5 text-slate-600">{row[2]}</td>
                                            <td className="p-5 font-bold text-emerald-800 bg-emerald-50/30">{row[3]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.section>

                {}
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 sm:px-12 sm:py-20 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">

                        <motion.div variants={fadeUp} className="flex-1 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-300">
                                Real-World Impact
                            </div>
                            <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                ₹12 Cr Turnover Precision Engineering Firm
                            </h2>
                            <p className="text-lg leading-relaxed text-slate-300">
                                Before Crown Ecosystems, their accounts clerk spent 3 hours daily typing 180 supplier bills. At year-end, their CA found ₹3.4 Lakhs in blocked ITC due to suspended vendor GSTINs. Now, that entire workflow is automated and verified instantly.
                            </p>
                        </motion.div>

                        <motion.div variants={staggerContainer} className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-md">
                                <p className="text-4xl font-bold text-emerald-400">100%</p>
                                <p className="mt-2 text-sm font-medium text-slate-300">ITC preserved with live 2B matching</p>
                            </motion.div>
                            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-md">
                                <p className="text-4xl font-bold text-emerald-400">0 Bills</p>
                                <p className="mt-2 text-sm font-medium text-slate-300">Duplicate payments eliminated</p>
                            </motion.div>
                            <motion.div variants={fadeUp} className="sm:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-md text-center">
                                <p className="text-4xl font-bold text-emerald-400">15 Mins</p>
                                <p className="mt-2 text-sm font-medium text-slate-300">Daily founder payment review time</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                >
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Ready to align your operations and accounting?</h3>
                        <p className="mt-1 text-sm text-slate-500">Explore tailored workflows or view our transparent pricing.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                        <Link
                            href="/who"
                            className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Read Who It's For
                        </Link>
                        <Link
                            href="/purchase"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600 hover:shadow-lg"
                        >
                            View Pricing Plans
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}