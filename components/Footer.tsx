import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-zinc-400">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

          {/* LEGAL */}
          <div className="flex flex-col gap-2">
            <p className="text-zinc-500 text-xs mb-1">Legal</p>

            <Link href="/privacidad" className="hover:text-zinc-200 transition">
              Política de privacidad
            </Link>

            <Link href="/uso" className="hover:text-zinc-200 transition">
              Términos de uso
            </Link>

            <Link href="/afiliados" className="hover:text-zinc-200 transition">
              Transparencia y afiliados
            </Link>

            <Link href="/politica" className="hover:text-zinc-200 transition">
              Política de reclamación de autores
            </Link>
          </div>

          {/* BRAND */}
          <div>
            <p className="text-zinc-200 font-medium">
              Cas(z)a de libros Indie
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              “Un hogar para historias. Una cacería de libros únicos.”
            </p>
          </div>

          {/* CONTACTO */}
          <div className="hidden md:flex flex-col gap-2">
            <p className="text-zinc-500 text-xs mb-1">Contacto</p>

            <Link href="/conoceme" className="hover:text-zinc-200 transition">
              Conóceme
            </Link>
          </div>

        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          © 2026 Cas(z)a de libros Indie. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  )
}