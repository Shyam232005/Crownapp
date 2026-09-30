"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Activity, CheckSquare, Landmark, Users,
  ShoppingCart, FileText, PieChart, Settings, LogOut, ShieldAlert
} from "lucide-react";

const navConfig = [
  {
    category: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, pathname: "/owner/dashboard" },
      { name: "Financial Health", icon: Activity, pathname: "/owner/financial" }
    ]
  },
  {
    category: "Operations",
    items: [
      { name: "Approvals Queue", icon: CheckSquare, pathname: "/owner/approvals" },
      { name: "Cash & Banking", icon: Landmark, pathname: "/owner/banking" }
    ]
  },
  {
    category: "Network & Supply",
    items: [
      { name: "Sales & Customers", icon: Users, pathname: "/owner/sales" },
      { name: "Purchases & Vendors", icon: ShoppingCart, pathname: "/owner/purchases" }
    ]
  },
  {
    category: "Compliance",
    items: [
      { name: "CA Hub", icon: FileText, pathname: "/owner/ca-hub" },
      { name: "Tax Reports", icon: PieChart, pathname: "/owner/tax-reports" }
    ]
  }
];

const bottomConfig = [
  { name: "Settings", icon: Settings, pathname: "/owner/settings" },
  { name: "Sign Out", icon: LogOut, pathname: "/" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter()

  const linkClasses = (isActive) =>
    `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive
      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
      : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col pt-6 pb-4">
      {/* Logo Area */}
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
