import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"

export default function PublicLayout({ children }) {
    return (
        <section>
            <Navbar />
            {children}
            <Footer />
        </section>
    )
}