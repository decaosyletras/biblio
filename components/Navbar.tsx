"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-zinc-900 text-zinc-100 p-4 sticky top-0 z-50">

      <div className="flex justify-between items-center">

        <Link href="/" className="font-bold text-lg">
          Biblio
        </Link>

        {/* LINKS SIEMPRE VISIBLES */}
        <div className="flex gap-4 text-sm">
          <Link href="/">Inicio</Link>
          <Link href="/resenas">Reseñas</Link>
          <Link href="/libros">Libros</Link>
          <Link href="/autores">Autores</Link>
        </div>

      </div>

    </nav>
  )
}