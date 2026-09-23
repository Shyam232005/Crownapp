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

export default function PlatformBenefitsPage() {
    const benefits = [
        {
            title: 'Always-Balanced Double-Entry Core',
            description: 'Every approved transaction writes mathematically verified journal vouchers where Total Debits strictly equal Total Credits. Eliminates suspense accounts and balance mismatches.',
            tag: 'Accounting Integrity',
            colorTheme: 'blue',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                </svg>
            )
        },
        {
            title: 'MCA-Compliant Immutable Audit Trail',
            description: 'Fully satisfies Ministry of Corporate Affairs regulations. Every voucher creation, adjustment, or user sign-off is time-stamped and preserved in an unalterable audit log.',
            tag: 'Statutory Mandate',
            colorTheme: 'amber',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            )
        },
        {
            title: 'GSTR-2B Input Tax Credit (ITC) Protection',
            description: 'Cross-checks vendor GSTINs and filing statuses before payouts are released, preventing blocked input tax credits and interest liabilities under Indian GST law.',
            tag: 'Tax Optimization',
            colorTheme: 'emerald',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            )
        },
        {
            title: 'Section 43B(h) MSME Payment Safeguard',
            description: 'Automatic 15-day and 45-day tracking for micro and small enterprise suppliers, ensuring expenditures are not disallowed during Income Tax return filing.',
            tag: 'Compliance',
            colorTheme: 'rose',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Zero Local Data-Corruption Backups',
            description: 'Hosted on secure cloud infrastructure with real-time replication. Eliminates the risk of damaged desktop database files, virus infections, and manual backup emailing.',
            tag: 'Infrastructure',
            colorTheme: 'indigo',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                </svg>
            )
        },
        {
            title: 'Read-Only Auditor Collaboration',
            description: 'Give external CAs direct audit-only workspace logins. They can inspect original source bills and download formatted audit schedules without disturbing operational staff.',
            tag: 'Collaboration',
            colorTheme: 'purple',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            )
        },
    ];

    const getTagColor = (theme) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            amber: 'bg-amber-50 text-amber-700 border-amber-200',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            rose: 'bg-rose-50 text-rose-700 border-rose-200',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            purple: 'bg-purple-50 text-purple-700 border-purple-200',
        };
        return colors[theme] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getIconColor = (theme) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            amber: 'bg-amber-100 text-amber-600',
            emerald: 'bg-emerald-100 text-emerald-600',
            rose: 'bg-rose-100 text-rose-600',
            indigo: 'bg-indigo-100 text-indigo-600',
            purple: 'bg-purple-100 text-purple-600',
        };
        return colors[theme] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="relative w-full bg-[#FAFAFA] pb-24 pt-12 sm:pt-16 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">

                {}
                <motion.section
                    className="text-center max-w-3xl mx-auto space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={fadeDown} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                        <span className="text-emerald-600">✦</span>
                        Core Advantages
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">Absolute Integrity</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} className="mx-auto text-lg leading-relaxed text-slate-600 sm:text-xl">
                        Give your growing enterprise strict financial governance, compliance safety, and real-time operational visibility—without the manual data entry overhead.
                    </motion.p>
                </motion.section>

                {}
                <section>
                    {}
                    <motion.div
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {benefits.map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeUp}
                                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${getIconColor(item.colorTheme)} transition-transform group-hover:scale-110`}>
                                            {item.icon}
                                        </div>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getTagColor(item.colorTheme)}`}>
                                            {item.tag}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                                        {item.title}
                                    </h2>
                                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                        {item.description}
                                    </p>
                                </div>

                                {}
                                <div className="mt-8 h-1 w-12 rounded-full bg-slate-100 transition-colors group-hover:bg-emerald-500"></div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {}
                <motion.section
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
                >
                    {}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    {}
                    <div className="absolute left-1/2 top-1/2 -z-10 h-[200px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/20 blur-[100px] animate-pulse-soft"></div>

                    <div className="relative z-10">
                        <h3 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Experience the difference in your daily operations
                        </h3>
                        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                            Stop fighting with legacy software. Book an interactive walk-through with our solution consultants tailored to your specific business model.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/contact"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-emerald-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30"
                            >
                                Schedule Consultation
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/purchase"
                                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-700"
                            >
                                Review Subscription Plans
                            </Link>
                        </div>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}