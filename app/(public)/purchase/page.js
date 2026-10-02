'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

export default function PurchaseSoftwarePage() {
    const [billingCycle, setBillingCycle] = useState('annual');
    const router = useRouter();

    const plans = [
        {
            name: 'MSME Starter',
            subtitle: 'For small trading and service units',
            monthlyPrice: 1999,
            annualPrice: 1499, // Per month calculation for annual
            features: [
                'Up to 3 Team Users',
                'Smart Invoice Ingestion (150 bills/mo)',
                'Founder Mobile Approval Flow',
                'Native Double-Entry General Ledger',
                'Basic GSTR-2B Verification',
                '1 Dedicated CA Audit Portal Login',
            ],
            popular: false,
        },
        {
            name: 'Manufacturing & Growth',
            subtitle: 'For manufacturing units & busy distributors',
            monthlyPrice: 4299,
            annualPrice: 3499,
            features: [
                'Up to 10 Team Users',
                'Unlimited Bill Ingestion (PDF & CSV)',
                'Full 3-Way Matching (PO, GRN & Bill)',
                'Section 43B(h) MSME Dues Tracker',
                'Automated TDS Register (194C, 194J, 194Q)',
                '2 Free CA Portal Logins + Excel Export',
            ],
            popular: true,
        },
        {
            name: 'Enterprise Multi-Unit',
            subtitle: 'For multi-branch & multi-GSTIN companies',
            monthlyPrice: 8499,
            annualPrice: 6999,
            features: [
                'Unlimited Users with Custom Roles',
                'Multi-Branch & Multi-GSTIN Support',
                'Dedicated Cloud Audit Trail Engine',
                'Custom Approval Hierarchies',
                'Priority CA Audit Concierge Support',
                'API & Custom ERP Migration Assistance',
            ],
            popular: false,
        },
    ];

    // ✨ Updated function to pass dynamic plan details to the payment page ✨
    const handlePurchaseClick = (plan) => {
        const isAnnual = billingCycle === 'annual';
        const finalPrice = isAnnual ? (plan.annualPrice * 12) : plan.monthlyPrice;
        const cycleName = isAnnual ? 'Annual' : 'Monthly';

        router.push(`/payment?plan=${encodeURIComponent(plan.name)}&cycle=${cycleName}&price=${finalPrice}`);
    };

    return (
        <div className="relative w-full bg-[#FAFAFA] pb-24 pt-12 sm:pt-20 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">

                <motion.div
                    className="text-center max-w-3xl mx-auto space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Simple, Transparent Plans for <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">
                            Indian MSMEs
                        </span>
                    </motion.h1>
                    <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
                        No hidden server setup costs, no expensive consultant fees. Choose the tier that fits your operational volume.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-5">
                        <div className="relative flex w-fit items-center rounded-full bg-slate-200/70 p-1 border border-slate-300/60 shadow-inner">
                            <div
                                className={`absolute top-1 bottom-1 left-1 w-[140px] rounded-full bg-slate-900 shadow-md transition-transform duration-300 ease-out ${billingCycle === 'monthly' ? 'translate-x-full' : 'translate-x-0'
                                    }`}
                            />

                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`relative z-10 w-[140px] rounded-full py-2.5 text-sm font-bold transition-colors duration-300 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Annual
                            </button>

                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`relative z-10 w-[140px] rounded-full py-2.5 text-sm font-bold transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                            Save 25% with Annual Billing
                        </div>
                    </motion.div>
                </motion.div>

                <div className="relative mx-auto max-w-7xl">
                    <motion.div
                        className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-4 items-center"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {plans.map((plan, idx) => {
                            const isAnnual = billingCycle === 'annual';
                            const displayPrice = isAnnual ? (plan.annualPrice * 12) : plan.monthlyPrice;
                            const periodSuffix = isAnnual ? '/ yr' : '/ mo';
                            const subtext = isAnnual
                                ? `Equivalent to ₹${plan.annualPrice.toLocaleString('en-IN')} / mo + GST`
                                : 'Billed monthly + GST';

                            return (
                                <motion.div
                                    key={idx}
                                    variants={fadeUp}
                                    className={`relative flex flex-col justify-between rounded-[2rem] bg-white p-8 transition-all duration-300 ${plan.popular
                                            ? 'z-10 border-2 border-emerald-500 shadow-2xl lg:scale-105 lg:p-10'
                                            : 'border border-slate-200 shadow-lg shadow-slate-200/50'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                                            Most Popular for MSMEs
                                        </div>
                                    )}

                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                                        <p className="mt-2 text-sm text-slate-500 min-h-[40px]">{plan.subtitle}</p>

                                        <div className="mt-6 flex items-baseline gap-1.5 border-b border-slate-100 pb-8 transition-all duration-300">
                                            <span className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center">
                                                ₹
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={displayPrice}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="inline-block ml-1"
                                                    >
                                                        {displayPrice.toLocaleString('en-IN')}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </span>
                                            <span className="text-sm font-medium text-slate-500">{periodSuffix}</span>
                                        </div>
                                        <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-h-[16px]">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={subtext}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="inline-block"
                                                >
                                                    {subtext}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>

                                        <ul className="mt-8 space-y-4 text-sm text-slate-700 font-medium">
                                            {plan.features.map((feat, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-3">
                                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${plan.popular ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        ✓
                                                    </span>
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-10">
                                        <div
                                            className={`flex w-full items-center justify-center rounded-xl cursor-pointer py-3.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 ${plan.popular
                                                    ? 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-500 hover:shadow-lg'
                                                    : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            onClick={() => handlePurchaseClick(plan)}
                                        >
                                            Get Started with {plan.name.split(' ')[0]}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

            </div>
        </div>
    );
}