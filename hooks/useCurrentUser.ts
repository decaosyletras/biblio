"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useCurrentUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getSession()

            const { data: userData } = await supabase.auth.getUser()

            setUser(userData.user ?? null)
            setLoading(false)
        }

        load()

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return { user, loading }
}