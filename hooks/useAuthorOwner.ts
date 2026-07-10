"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { isAuthorOwner } from "@/lib/authorOwnership"

export function useAuthorOwner(authorId: string | null) {
    const [isOwner, setIsOwner] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const run = async () => {
            if (!authorId) return

            setLoading(true)

            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!user) {
                setIsOwner(false)
                setLoading(false)
                return
            }

            const result = await isAuthorOwner(authorId, user.id)

            setIsOwner(result)
            setLoading(false)
        }

        run()
    }, [authorId])

    return { isOwner, loading }
}