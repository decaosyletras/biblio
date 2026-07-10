"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useProfile } from "@/hooks/useProfile"

type Author = {
  id: string
  name: string
}

type Claim = {
  author_id: string
  status: "pending" | "approved" | "rejected"
}

type Props = {
  authors?: Author[]
}

export default function ClaimAuthorButton({ authors = [] }: Props) {
  const { user, loading: userLoading } = useCurrentUser()
  const { profile, loading: profileLoading } = useProfile()

  const safeAuthors = useMemo(
    () => Array.isArray(authors) ? authors : [],
    [authors]
  )

  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [claims, setClaims] = useState<Claim[]>([])
  const [approvedAuthors, setApprovedAuthors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (safeAuthors.length > 0 && !selectedAuthor) {
      setSelectedAuthor(safeAuthors[0].id)
    }
  }, [safeAuthors, selectedAuthor])

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("author_claims")
        .select("author_id, status")
        .eq("user_id", user.id)

      if (error) {
        setClaims([])
        setLoading(false)
        return
      }

      setClaims((data ?? []) as Claim[])

      const { data: approvedData } = await supabase
        .from("author_claims")
        .select("author_id")
        .eq("status", "approved")

      setApprovedAuthors(
        (approvedData ?? []).map(a => a.author_id)
      )
      setLoading(false)
    }

    if (!userLoading) load()
  }, [user, userLoading])

  if (userLoading || loading || profileLoading) return null
  if (!user) return null
  if (safeAuthors.length === 0) return null

  const currentAuthorId = selectedAuthor
  const currentClaim = claims.find(c => c.author_id === currentAuthorId)

  const authorAlreadyOwned =
    approvedAuthors.includes(currentAuthorId) &&
    currentClaim?.status !== "approved"

  const hasApprovedAny = claims.some(c => c.status === "approved")
  const hasPendingAny = claims.some(c => c.status === "pending")

  const isApproved = currentClaim?.status === "approved"
  const isPending = currentClaim?.status === "pending"
  const isRejected = currentClaim?.status === "rejected"

  const globalBlock = hasApprovedAny

  const hasPendingOther =
    claims.some(
      c =>
        c.status === "pending" &&
        c.author_id !== currentAuthorId
    )

  const canClaim =
    !authorAlreadyOwned &&
    !globalBlock &&
    !hasPendingOther &&
    (!currentClaim || currentClaim.status === "rejected")

  const claimAuthor = async () => {
    setSending(true)

    const { error } = await supabase.from("author_claims").insert({
      user_id: user.id,
      author_id: currentAuthorId,
      status: "pending",
    })

    setSending(false)

    if (error) {
      alert(error.message)
      return
    }

    setClaims(prev => [
      ...prev.filter(c => c.author_id !== currentAuthorId),
      { author_id: currentAuthorId, status: "pending" }
    ])
  }

  return (
    <div className="mt-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-1">

      {/* INTRO */}
      {!hasApprovedAny && claims.length === 0 && (
        <>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            ✍️ Reclamar autor
          </h3>

          <p className="text-sm text-zinc-400 mb-4">
            Solicita la gestión de este autor.
          </p>
        </>
      )}

      {/* SELECT */}
      {safeAuthors.length > 1 && canClaim && (
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="w-full mb-4 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
        >
          {safeAuthors.map(a => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      {/* STATES */}
      {isPending && (
        <p className="text-yellow-400 text-sm">
          ⏳ Solicitud pendiente
        </p>
      )}

      {isApproved && (
        <p className="text-green-400 text-sm">
          ✅ Este autor ya es tuyo
        </p>
      )}

      {authorAlreadyOwned && !hasApprovedAny && (
        <p className="text-zinc-400 text-sm mt-1">
          🔒 Este autor ya está verificado y gestionado por otra cuenta.
          Si necesitas revisar el caso, contáctanos.
        </p>
      )}

      {isRejected && !authorAlreadyOwned && !hasPendingAny && !hasApprovedAny && (
        <p className="text-red-400 text-sm">
          ❌ Rechazado — puedes intentarlo otra vez o contactarnos por redes sociales.
        </p>
      )}

      {/* BOTÓN */}
      {canClaim && (
        <button
          onClick={claimAuthor}
          disabled={sending}
          className="w-full mt-3 rounded-xl bg-stone-100 py-3 text-stone-900 font-semibold hover:bg-blue-500 disabled:opacity-50"
        >
          {sending ? "Enviando..." : "Reclamar autor"}
        </button>
      )}

    </div>
  )
}