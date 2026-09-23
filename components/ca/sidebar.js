"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  FolderKanban,
  FileSpreadsheet,
  PieChart,
  Download,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";

const navConfig = [
  {
    category: "Practice Overview",
    items: [
      { name: "Firm Dashboard", icon: LayoutDashboard, pathname: "/ca/dashboard" },
      { name: "Filing Calendar", icon: Calendar, pathname: "/ca/filing-calendar" },
    ],
  },
  {
    category: "Client Management",
    items: [
      { name: "Client Directory", icon: Briefcase, pathname: "/ca/clients" },
      { name: "Staff Assignments", icon: FolderKanban, pathname: "/ca/staff-assignments" },
    ],
  },
  {
    category: "Tax & Compliance",
    items: [
      { name: "GST Summary", icon: FileSpreadsheet, pathname: "/ca/gst-summary" },
      { name: "Audit Reports", icon: PieChart, pathname: "/ca/audit-reports" },
    ],
  },
  {
    category: "Data Hub",
    items: [
      { name: "Tally / ERP Sync", icon: Download, pathname: "/ca/data-sync" },
    ],
  },
];

const bottomConfig = [
  { name: "Firm Settings", icon: Settings, pathname: "/ca/settings" },
  { name: "Sign Out", icon: LogOut, pathname: "/logout" },
];

export default function CASidebar() {
  const pathname = usePathname();

  const linkClasses = (isActive) =>
    `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col pt-6 pb-4">
      {/* Logo */}
      <div className="px-8 flex items-center mb-8">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">FineOps</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        {navConfig.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              {section.category}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.pathname;
                return (
                  <Link
                    key={itemIdx}
                    href={item.pathname}
                    aria-current={isActive ? "page" : undefined}
                    className={linkClasses(isActive)}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="px-4 pt-4 border-t border-gray-100 space-y-1 mt-auto">
        {bottomConfig.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.pathname;
          return (
            <Link
              key={idx}
              href={item.pathname}
              aria-current={isActive ? "page" : undefined}
              className={linkClasses(isActive)}
            >
              <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
