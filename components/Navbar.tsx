import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex justify-between p-6 border-b bg-white">
      <div className="font-bold">LOGO</div>

      <div className="flex gap-6 text-sm">
        <Link href="/resenas">Reseñas</Link>
        <Link href="/libros">Mis libros</Link>
        <Link href="/autores">Autores</Link>
        <Link href="/recursos">Recursos</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contacto">Contacto</Link>
      </div>
    </nav>
  )
}