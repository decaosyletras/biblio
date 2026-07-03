"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Callback() {
    const router = useRouter()

    useEffect(() => {
        const run = async () => {
            await supabase.auth.getSession()
            router.push("/")
        }

        run()
    }, [])

    return <p>Entrando...</p>
}