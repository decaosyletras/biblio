"use server"

import { createClient } from "@/lib/supabase-server"

export async function loginAction(
  email: string,
  password: string
) {
  const supabase = await createClient()

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    })

  if (error) {
    return {
      error: error.message
    }
  }

  return {
    error: null
  }
}