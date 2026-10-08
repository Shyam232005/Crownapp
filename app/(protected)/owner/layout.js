import Sidebar from "@/components/owner/sidebar"
import GlobalHeader from "@/components/global/header"

export default function OwnerLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <GlobalHeader />
                <main className="flex-1 overflow-y-auto scrollbar-hide min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}