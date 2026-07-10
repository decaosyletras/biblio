"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useCurrentUser } from "./useCurrentUser"

export function useProfile() {
    const { user, loading: userLoading } = useCurrentUser()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            // ⛔ todavía no sabemos estado auth
            if (userLoading) return

            // ❗ auth resuelta, pero no hay user
            if (!user) {
                setProfile(null)
                setLoading(false)
                return
            }

            setLoading(true)

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (error) {
                setProfile(null)
            } else {
                setProfile(data ?? null)
            }

            setLoading(false)
        }

        load()
    }, [user, userLoading])

    return {
        profile,
        user,
        loading: userLoading || loading
    }
}