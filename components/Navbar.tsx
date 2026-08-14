"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
// FaHome se conserva comentado porque el nombre de marca con icono sigue como
// alternativa visual en el bloque JSX inferior.
// import { FaHome } from "react-icons/fa";
import { supabase } from "@/lib/supabase"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [sessionResolved, setSessionResolved] = useState(false)

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      setHasSession(Boolean(data.session))
      setSessionResolved(true)
    }

    loadSession()

    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session))
      setSessionResolved(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="bg-zinc-900 text-zinc-100 p-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* LOGO + NOMBRE */}
        <Link href="/" className="flex items-center">
          <div className="relative w-40 h-16 md:w-54 md:h-20 overflow-hidden rounded-lg">
            <Image
              src="/logo/casadelibros4.png"
              alt="Casa Indie Logo"
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/*<span className="flex items-center gap-2">
            <FaHome />
            Casa Indie
          </span>*/}
        </Link>

        {/* BOTÓN MOBILE */}
        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="text-2xl lg:hidden"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* LINKS DESKTOP */}
        <div className="hidden items-center gap-4 text-sm lg:flex">
          <Link href="/">Inicio</Link>
          <Link href="/libros">Catálogo</Link>
          <Link href="/resenas">Lectómetro</Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none select-none">
              Biblioteca <span aria-hidden="true">▾</span>
            </summary>
            <div className="absolute left-0 top-full z-60 mt-3 flex w-52 flex-col gap-1 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl shadow-black/40">
              <Link
                href="/book-directory"
                className="rounded-lg px-3 py-2 hover:bg-zinc-800"
              >
                Biblioteca general
              </Link>
              {sessionResolved && hasSession ? (
                <Link
                  href="/me/library"
                  className="rounded-lg px-3 py-2 hover:bg-zinc-800"
                >
                  Mi biblioteca
                </Link>
              ) : sessionResolved ? (
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Inicia sesión para crear la tuya
                </Link>
              ) : null}
            </div>
          </details>
          <details className="group relative">
            <summary className="cursor-pointer list-none select-none">
              Comunidad <span aria-hidden="true">▾</span>
            </summary>
            <div className="absolute right-0 top-full z-60 mt-3 flex w-40 flex-col gap-1 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl shadow-black/40">
              <Link
                href="/authors"
                className="rounded-lg px-3 py-2 hover:bg-zinc-800"
              >
                Autores
              </Link>
              <Link
                href="/readers"
                className="rounded-lg px-3 py-2 hover:bg-zinc-800"
              >
                Lectores
              </Link>
            </div>
          </details>
          <Link href="/tutorial">Tutoriales</Link>
          {sessionResolved && (
            <Link
              href={hasSession ? "/me" : "/login"}
              className="rounded-full border border-yellow-500/50 px-4 py-2 font-medium text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
            >
              {hasSession ? "Mi espacio" : "Iniciar sesión"}
            </Link>
          )}
          {/*<Link href="/afiliados">Transparencia</Link>
          <Link href="/privacidad">Privacidad</Link>*/}
        </div>
      </div>

      {/* MENÚ MOBILE */}
      {open && (
        <div className="mt-4 rounded-xl bg-zinc-800 p-4 text-sm shadow-lg lg:hidden">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Explorar
            </p>
            <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
            <Link href="/libros" onClick={() => setOpen(false)}>Catálogo</Link>
            <Link href="/resenas" onClick={() => setOpen(false)}>Lectómetro</Link>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-700 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Biblioteca
            </p>
            <Link href="/book-directory" onClick={() => setOpen(false)}>
              Biblioteca general
            </Link>
          {sessionResolved && hasSession && (
            <Link href="/me/library" onClick={() => setOpen(false)}>
              Mi biblioteca
            </Link>
          )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-700 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Comunidad
            </p>
            <Link href="/authors" onClick={() => setOpen(false)}>Autores</Link>
            <Link href="/readers" onClick={() => setOpen(false)}>Lectores</Link>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-700 pt-4">
            <Link href="/tutorial" onClick={() => setOpen(false)}>
              Tutoriales
            </Link>
          {sessionResolved && (
            <Link
              href={hasSession ? "/me" : "/login"}
              onClick={() => setOpen(false)}
              className="rounded-xl border border-yellow-500/50 px-4 py-2.5 text-center font-medium text-yellow-300"
            >
              {hasSession ? "Mi espacio" : "Iniciar sesión"}
            </Link>
          )}
          </div>
          {/*<Link href="/afiliados" onClick={() => setOpen(false)}>Transparencia</Link>
          <Link href="/privacidad" onClick={() => setOpen(false)}>Privacidad</Link>*/}
        </div>
      )}
    </nav>
  )
}
