import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import CASidebar from "@/components/ca/sidebar";
import GlobalHeader from "@/components/global/header";

export default async function CaLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;

    if (token) {
        try {
            const decoded = jwt.decode(token);
            const role = decoded?.role || decoded?.normalizedRole;
            if (role === "CA-Employee" || role === "CAStaff" || role === "CA_STAFF") {
                redirect("/ca-staff/dashboard");
            }
        } catch (_) {}
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <CASidebar />
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <GlobalHeader />
                <main className="flex-1 overflow-y-auto scrollbar-hide min-w-0 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
