"use client"

import { useState } from "react"
import Link from "next/link"
import { FaHome } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-zinc-900 text-zinc-100 p-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          <FaHome />
          Casa Indie
        </Link>

        {/* BOTÓN MOBILE */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* LINKS DESKTOP */}
        <div className="hidden md:flex gap-4 text-sm">
          <Link href="/">Inicio</Link>
          {/*<Link href="/libros">Libros</Link>*/}
          {/*<Link href="/resenas">Lectómetro</Link>*/}
          {/*<Link href="/autores">Autores</Link>*/}
          <Link href="/conoceme">Conóceme</Link>
          <Link href="/contacto">Recomendar</Link>
          <Link href="/afiliados">Transparencia</Link>
        </div>
      </div>

      {/* MENÚ MOBILE */}
      {open && (
        <div className="md:hidden mt-4 bg-zinc-800 rounded-xl p-4 flex flex-col gap-3 text-sm shadow-lg">
          <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
          {/*<Link href="/libros" onClick={() => setOpen(false)}>Libros</Link>*/}
          {/*<Link href="/resenas" onClick={() => setOpen(false)}>Lectómetro</Link>*/}
          {/*<Link href="/autores" onClick={() => setOpen(false)}>Autores</Link>*/}
          <Link href="/conoceme" onClick={() => setOpen(false)}>Conóceme</Link>
          <Link href="/contacto" onClick={() => setOpen(false)}>Recomendar</Link>
          <Link href="/afiliados" onClick={() => setOpen(false)}>Transparencia</Link>
        </div>
      )}
    </nav>
  )
}