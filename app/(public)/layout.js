import LNavbar from "@/components/LandingNavbar"

export const metadata = {
    title: "Crown Ecosystem",
    description: "The FineOps software for make business finance effectively",
};

export default function DashboardLayout({ children }) {
    return <section><LNavbar />{children}</section>
}