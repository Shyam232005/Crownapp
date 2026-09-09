import { Geist, Geist_Mono } from "next/font/google"
import Footer from "@/components/footerforall"
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Crown Ecosystem",
  description: "The FineOps software for make business finance effectively",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionWrapper>
          {children}
          <Footer />
        </SessionWrapper>
      </body>
    </html >
  );
}
