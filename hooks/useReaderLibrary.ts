"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export type ReaderLibraryState = Record<
  string,
  {
    isRead: boolean
  }
>

export type ReaderHiddenBooksState = Record<string, true>

export function useReaderLibrary() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [library, setLibrary] = useState<ReaderLibraryState>({})
  const [hiddenBooks, setHiddenBooks] = useState<ReaderHiddenBooksState>({})
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [pendingBookId, setPendingBookId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setLibrary({})
      setHiddenBooks({})
      setLibraryLoading(false)
      return
    }

    let active = true

    async function loadLibrary() {
      setLibraryLoading(true)
      setMessage("")

      try {
        const [libraryResponse, hiddenResponse] = await Promise.all([
          fetch("/api/readers/books", { cache: "no-store" }),
          fetch("/api/readers/hidden-books", { cache: "no-store" }),
        ])

        if (!libraryResponse.ok || !hiddenResponse.ok) {
          if (active) setMessage("No se pudieron cargar tus preferencias de libros.")
          return
        }

        const [libraryResult, hiddenResult] = await Promise.all([
          libraryResponse.json(),
          hiddenResponse.json(),
        ])

        if (!active) return

        const nextLibrary: ReaderLibraryState = {}

        for (const item of libraryResult.books ?? []) {
          if (typeof item.bookId === "string") {
            nextLibrary[item.bookId] = {
              isRead: item.isRead === true,
            }
          }
        }

        const nextHiddenBooks: ReaderHiddenBooksState = {}

        for (const item of hiddenResult.books ?? []) {
          if (typeof item.bookId === "string") {
            nextHiddenBooks[item.bookId] = true
          }
        }

        setLibrary(nextLibrary)
        setHiddenBooks(nextHiddenBooks)
      } catch {
        if (active) setMessage("No se pudo conectar con tu biblioteca.")
      } finally {
        if (active) setLibraryLoading(false)
      }
    }

    loadLibrary()

    return () => {
      active = false
    }
  }, [user, userLoading])

  function requireSession() {
    if (user) return true

    router.push("/login")
    return false
  }

  async function saveBook(bookId: string, isRead: boolean) {
    if (!requireSession()) return false

    setPendingBookId(bookId)
    setMessage("")

    try {
      if (hiddenBooks[bookId]) {
        const restoreResponse = await fetch("/api/readers/hidden-books", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        })
        const restoreResult = await restoreResponse.json()

        if (!restoreResponse.ok) {
          setMessage(
            restoreResult.error ?? "No se pudo restaurar el libro oculto."
          )
          return false
        }

        setHiddenBooks((current) => {
          const next = { ...current }
          delete next[bookId]
          return next
        })
      }

      const response = await fetch("/api/readers/books", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, isRead }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return false
      }

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo actualizar tu biblioteca.")
        return false
      }

      setLibrary((current) => ({
        ...current,
        [bookId]: {
          isRead: result.book?.isRead === true,
        },
      }))

      return true
    } catch {
      setMessage("No se pudo conectar con la biblioteca.")
      return false
    } finally {
      setPendingBookId(null)
    }
  }

  async function removeBook(bookId: string) {
    if (!requireSession()) return false

    setPendingBookId(bookId)
    setMessage("")

    try {
      const response = await fetch("/api/readers/books", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return false
      }

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo quitar el libro.")
        return false
      }

      setLibrary((current) => {
        const next = { ...current }
        delete next[bookId]
        return next
      })

      return true
    } catch {
      setMessage("No se pudo conectar con la biblioteca.")
      return false
    } finally {
      setPendingBookId(null)
    }
  }

  async function hideBook(bookId: string) {
    if (!requireSession()) return false

    setPendingBookId(bookId)
    setMessage("")

    try {
      const response = await fetch("/api/readers/hidden-books", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return false
      }

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo ocultar el libro.")
        return false
      }

      setHiddenBooks((current) => ({ ...current, [bookId]: true }))
      return true
    } catch {
      setMessage("No se pudo conectar con tus libros ocultos.")
      return false
    } finally {
      setPendingBookId(null)
    }
  }

  async function restoreBook(bookId: string) {
    if (!requireSession()) return false

    setPendingBookId(bookId)
    setMessage("")

    try {
      const response = await fetch("/api/readers/hidden-books", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return false
      }

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo volver a mostrar el libro.")
        return false
      }

      setHiddenBooks((current) => {
        const next = { ...current }
        delete next[bookId]
        return next
      })
      return true
    } catch {
      setMessage("No se pudo conectar con tus libros ocultos.")
      return false
    } finally {
      setPendingBookId(null)
    }
  }

  return {
    user,
    userLoading,
    library,
    hiddenBooks,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
    removeBook,
    hideBook,
    restoreBook,
  }
}
