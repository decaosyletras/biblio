import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="bg-[#18181b] text-zinc-100 min-h-screen">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}