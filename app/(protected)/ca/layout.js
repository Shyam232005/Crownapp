import CASidebar from "@/components/ca/sidebar";
import GlobalHeader from "@/components/global/header"

export default function CaLayout({ children }) {
    return (
        <div className="flex h-screen">
            <CASidebar />
            <div className="flex-1 flex flex-col">
                <GlobalHeader />
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
