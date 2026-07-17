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

  const [acceptedClaimPolicy, setAcceptedClaimPolicy] = useState(false)

  const [proofNotes, setProofNotes] = useState("")
  const [proofUrl, setProofUrl] = useState("")

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
    acceptedClaimPolicy &&
    !authorAlreadyOwned &&
    !globalBlock &&
    !hasPendingOther &&
    (!currentClaim || currentClaim.status === "rejected")

  const claimAuthor = async () => {

    if (!proofNotes.trim() || !proofUrl.trim()) {
      alert("Debes añadir una explicación y un enlace de verificación")
      return
    }

    setSending(true)

    const response = await fetch("/api/author-claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        author_id: currentAuthorId,
        aceptaPolitica: acceptedClaimPolicy,
        proof_notes: proofNotes,
        proof_url: proofUrl
      })
    })


    const result = await response.json()

    console.log("RESPUESTA CLAIM:", result)


    if (!response.ok) {
      alert(result.error)
      setSending(false)
      return
    }

    setSending(false)

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
            ✍️ Solicita la gestión de este autor.
          </h3>
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

      {!isApproved && !isPending && (
        <label className="
    flex
    items-start
    gap-3
    text-sm
    text-zinc-300
    mt-4
  ">

          <input
            type="checkbox"
            checked={acceptedClaimPolicy}
            onChange={(e) => setAcceptedClaimPolicy(e.target.checked)}
            className="mt-1"
          />

          <span>
            Declaro que soy el autor, representante autorizado
            o tengo autorización suficiente para solicitar este perfil.

            {" "}

            <a
              href="/politica"
              target="_blank"
              className="text-yellow-400 hover:underline"
            >
              Ver política de reclamación de autores
            </a>

          </span>

        </label>
      )}

      {canClaim && (
        <div className="mt-4 space-y-3">

          <textarea
            value={proofNotes}
            onChange={(e) => setProofNotes(e.target.value)}
            placeholder="Cuéntanos por qué eres el autor o representante autorizado..."
            maxLength={500}
            rows={3}
            className="
        w-full
        rounded-xl
        bg-zinc-800
        border
        border-zinc-700
        p-3
        text-sm
      "
          />

          <input
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="Link de verificación (web, red social, editorial...)"
            className="
        w-full
        rounded-xl
        bg-zinc-800
        border
        border-zinc-700
        p-3
        text-sm
      "
          />

        </div>
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