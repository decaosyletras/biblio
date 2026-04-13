import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-zinc-900/70 backdrop-blur border-b border-zinc-700 border-b">
      <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        
        <div className="font-semibold text-lg tracking-tight">
          Biblioteca Indie
        </div>

        <div className="hidden md:flex gap-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-black transition">Inicio</Link>
          <Link href="/resenas" className="hover:text-black transition">Mis reseñas</Link>
          <Link href="/libros" className="hover:text-black transition">Libros</Link>
          <Link href="/autores" className="hover:text-black transition">Autores</Link>
          <Link href="/recursos" className="hover:text-black transition">Recursos</Link>
          <Link href="/blog" className="hover:text-black transition">Blog</Link>
          <Link href="/contacto" className="hover:text-black transition">Contacto</Link>
        </div>

      </div>
    </nav>
  )
}