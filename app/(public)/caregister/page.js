"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CARegister = () => {
  const router = useRouter()
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    caName: '',
    icaiNumber: '',
    firmName: '',
    password: '',
    city: '',
    email: '',
    phone: '',
    clientCount: '10-25',
    referredBy: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/casumbited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if(res.ok){
        return router.push("calogin")
      }
    } catch (error) {
      alert("The form is not summited due to server isusses, pleases try again later")
    } finally {
      setFormData({
        caName: '',
        icaiNumber: '',
        firmName: '',
        city: '',
        email: '',
        phone: '',
        clientCount: '10-25',
        referredBy: '',
        password: '',
      })
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
          ICAI Members &amp; Audit Partners
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Chartered Accountant Partner Registration
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Get complimentary access to the Crown Ecosystems Auditor Workspace for your audit practice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* CA Partner Benefits */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Partner Privileges</h2>
          <ul className="text-xs text-slate-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>100% Free CA Workspace:</strong> Zero software cost for audit firms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Multi-Client Dashboard:</strong> Switch between all your MSME clients in one login.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Direct Tax Audit Schedules:</strong> Export pre-formatted Section 44AB workbooks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Audit Trail Verified:</strong> Compliance certification for MCA audit rules.</span>
            </li>
          </ul>

          <div className="border-t border-slate-100 pt-3">
            <Link
              href="calogin"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Preview the CA Audit Portal →
            </Link>
          </div>
        </div>

        {/* Registration Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          {registered ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
                ✓
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Registration Submitted</h3>
              <p className="mt-1 text-xs text-slate-500">
                We have received your details. Our CA partnerships desk will verify your ICAI credentials and email your Auditor Workspace access keys within 4 hours.
              </p>
              <div className="mt-6">
                <Link
                  href="calogin"
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Visit CA Portal
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Member Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.caName}
                    onChange={(e) => setFormData({ ...formData, caName: e.target.value })}
                    placeholder="CA. Mehul Patel"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">ICAI Membership No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.icaiNumber}
                    onChange={(e) => setFormData({ ...formData, icaiNumber: e.target.value })}
                    placeholder="e.g. 142850"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">CA Firm / Practice Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    placeholder="M. Patel &amp; Associates"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">City / State *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ahmedabad, Gujarat"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official CA Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mehul@mpatelca.com"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98980 00000"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">MSME Clients Handled</label>
                <select
                  value={formData.clientCount}
                  onChange={(e) => setFormData({ ...formData, clientCount: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="1-10">1 to 10 Business Clients</option>
                  <option value="10-25">10 to 25 Business Clients</option>
                  <option value="25-50">25 to 50 Business Clients</option>
                  <option value="50+">50+ Enterprise Clients</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Referred By (Whom / Client / Fellow CA)
                </label>
                <input
                  type="text"
                  value={formData.referredBy}
                  onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                  placeholder="e.g. Crown Fabrics, CA Suresh Shah, or Referral Code"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  Enter the client name, fellow CA, or advisor who recommended Crown.
                </span>
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Create Your Auditor Portal Password *
                </label>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your security password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg border border-emerald-600/30 bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition shadow-sm"
              >
                Register as Certified CA Partner
              </button>
            </form>
          )}
        </div>
      </div>
    </div >
  )
}

export default CARegister
