import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Crown Ecosystem",
    description: "The FineOps software for make business finance effectively",
};

export default async function DashboardLayout({ children }) {
    const session = getServerSession(authOptions)
    console.log(session)
    if(!session){
        return redirect("login")
    }
    return (
        <section>
            {children}
        </section>
    )
}