import EmployeeSidebar from "@/components/employees/owner/sidebar";
import GlobalHeader from "@/components/global/header"

export default function EmployeeLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <EmployeeSidebar />
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <GlobalHeader />
                <main className="flex-1 overflow-y-auto scrollbar-hide min-w-0 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
