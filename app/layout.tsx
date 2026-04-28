import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import FloatingBack from "@/components/FloatingBack"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 min-h-screen">
          <Navbar />
            <FloatingBack />
            {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}