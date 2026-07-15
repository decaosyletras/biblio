export default function AuthorFooter() {
  return (
    <footer className="py-8 text-center text-sm text-zinc-400">
      <p>
        Página creada con Casa de Libros Indie.
      </p>

      <a
        href="/authors"
        className="underline hover:text-white transition"
      >
        Explorar autores independientes
      </a>
    </footer>
  )
}