"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import FloatingBack from "@/components/FloatingBack"
import AuthorFooter from "@/components/AuthorFooter"

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isAuthorPage = pathname.startsWith("/authors/")

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#151518] via-zinc-950 to-black text-zinc-100">

      {!isAuthorPage && <Navbar />}

      {!isAuthorPage && <FloatingBack />}

      {children}

      {isAuthorPage ? <AuthorFooter /> : <Footer />}

    </div>
  )
}
