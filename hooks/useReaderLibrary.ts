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

export function useReaderLibrary() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [library, setLibrary] = useState<ReaderLibraryState>({})
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [pendingBookId, setPendingBookId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setLibrary({})
      setLibraryLoading(false)
      return
    }

    let active = true

    async function loadLibrary() {
      setLibraryLoading(true)
      setMessage("")

      try {
        const response = await fetch("/api/readers/books", {
          cache: "no-store",
        })

        if (!response.ok) {
          if (active) setMessage("No se pudo cargar tu biblioteca.")
          return
        }

        const result = await response.json()

        if (!active) return

        const nextLibrary: ReaderLibraryState = {}

        for (const item of result.books ?? []) {
          if (typeof item.bookId === "string") {
            nextLibrary[item.bookId] = {
              isRead: item.isRead === true,
            }
          }
        }

        setLibrary(nextLibrary)
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

  return {
    user,
    userLoading,
    library,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
    removeBook,
  }
}
