"use client"
import React from 'react'
import { useState } from 'react'
import Link from 'next/link'

const Purchase = () => {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'annual' | 'monthly'

  const plans = [
    {
      name: 'Basic Plan Price',
      subtitle: 'Start-Up & Entrepreneur',
      monthlyPrice: 999,
      annualPrice: 9999,
      features: [
        'Up to 1-10 Team Users',
        'Smart Invoice Ingestion (500 bills/month)',
        'Founder Mobile Approval Flow',
        'Free Automation Double-Entry General Ledger',
        'GST Verification + Export charge of ₹50 per Export',
        '1 Dedicated CA Audit Portal Login',
      ],
      popular: false,
    },
    {
      name: 'Advance Plan Price',
      subtitle: 'Manufacturing & Scaling',
      monthlyPrice: 4999,
      annualPrice: 49999,
      features: [
        'Up to 10-100 Team Users',
        'Unlimited Bill Ingestion (PDF & CSV)',
        'Full 3-Way Matching (PO, GRN & Bill)',
        'Section 43B(h) MSME Dues Tracker',
        'Automated TDS Register (194C, 194J, 194Q)',
        '5 Free CA Portal Logins + Free 10,000 Export',
        'Includes all Services of Basic Plan',
      ],
      popular: true,
    },
    {
      name: 'Pro Plans Price',
      subtitle: 'Business Multi-Stores',
      monthlyPrice: 8499,
      annualPrice: 87999,
      features: [
        'Unlimited Users with Custom Roles',
        'Free Unlimited Exports',
        'Multi-Branch Support/Monitor',
        'Dedicated Cloud Audit Trail for CA',
        'Custom Approval Hierarchies for Customs Roles',
        'Priority CA Audit Concierge Support',
        'Custom ERP Migration Assistance',
        'Include All Services of Basic and Advance Plan',
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 ">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Simple, Transparent Plans are Wating to Approve
        </h1>
        <p className="mt-2 text-sm text-slate-500 ">
          No hidden server setup costs, no expensive consultant fees. Includes full statutory compliance.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="mt-6 inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm hover:shadow-[0_0_20px_theme(colors.emerald.600)] transition duration-500">
          <button
            onClick={() => setBillingCycle('annual')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${billingCycle === 'annual'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Annual Billing <span className="text-emerald-400 font-normal">(Save 15%)</span>
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${billingCycle === 'monthly'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan, idx) => {
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={idx}
              className={`flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 shadow-sm transition ${plan.popular
                  ? 'border-2 border-emerald-600 relative'
                  : 'border border-slate-200'
                }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-600 bg-emerald-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Most Popular for MSMEs
                </span>
              )}

              <div>
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{plan.subtitle}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">/ month + GST</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                </p>

                {/* Features List */}
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-4">
                <Link
                  href="payment"
                  className={`block w-full py-2.5 text-center text-xs font-semibold rounded-xl shadow-sm transition border ${plan.popular
                      ? 'border-emerald-600/30 bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assurance Note */}
      <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        All plans include automatic MCA Audit Trail logs, SSL encryption, daily automated backups, and zero per-machine licensing locks.
      </div>
    </div>
  )
}

export default Purchase
