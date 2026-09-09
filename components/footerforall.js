import React from 'react'

const Footer = () => {
  return (
     <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8 text-xs text-slate-500 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
                <div>
                    <span className="font-semibold text-slate-700">Crown Ecosystems</span> — Local First FinOps &amp; Core ERP
                </div>
                <p>© {new Date().getFullYear()} Crown Ecosystems. Built for businesses, finance professionals, and Chartered Accountants worldwide.</p>
            </div>
        </footer>
  )
}

export default Footer
