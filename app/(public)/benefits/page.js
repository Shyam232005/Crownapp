import React from 'react'
import Link from 'next/link'

const Benefits = () => {
  const benefits = [
    {
      title: 'Always-Balanced Double-Entry Core',
      description: 'Every approved transaction writes mathematically verified journal vouchers where Total Debits strictly equal Total Credits. Eliminates suspense accounts and balance mismatches.',
      tag: 'Accounting Integrity',
    },
    {
      title: 'MCA-Compliant Immutable Audit Trail',
      description: 'Fully satisfies Ministry of Corporate Affairs regulations. Every voucher creation, adjustment, or user sign-off is time-stamped and preserved in an unalterable audit log.',
      tag: 'Statutory Mandate',
    },
    {
      title: 'GSTR-2B Input Tax Credit (ITC) Protection',
      description: 'Cross-checks vendor GSTINs and filing statuses before payouts are released, preventing blocked input tax credits and interest liabilities under Indian GST law.',
      tag: 'Tax Optimization',
    },
    {
      title: 'Section 43B(h) MSME Payment Safeguard',
      description: 'Automatic 15-day and 45-day tracking for micro and small enterprise suppliers, ensuring expenditures are not disallowed during Income Tax return filing.',
      tag: 'Compliance',
    },
    {
      title: 'Zero Local Data-Corruption Backups',
      description: 'Hosted on secure cloud infrastructure with real-time replication. Eliminates the risk of damaged desktop database files, virus infections, and manual backup emailing.',
      tag: 'Infrastructure',
    },
    {
      title: 'Read-Only Auditor Collaboration',
      description: 'Give external CAs direct audit-only workspace logins. They can inspect original source bills and download formatted audit schedules without disturbing operational staff.',
      tag: 'Collaboration',
    },
  ]
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Platform Benefits</h1>
        <p className="mt-1 text-sm text-slate-500">
          Designed to give growing Indian enterprises automated financial governance without manual overhead.
        </p>
      </div>

      {/* Grid of Benefits */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {benefits.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {item.tag}
            </span>
            <h2 className="mt-3 text-base font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Action Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Experience the difference in your daily operations</h3>
        <p className="mt-1 text-xs text-slate-500">Book an interactive walk-through with our solution consultants.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="contact"
            className="rounded-lg border border-emerald-600/30 bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition"
          >
            Schedule Consultation
          </Link>
          <Link
            href="purchase"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Review Subscription Plans
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Benefits
