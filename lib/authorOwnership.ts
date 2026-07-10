import { supabase } from "@/lib/supabase"

export async function isAuthorOwner(authorId: string, userId: string) {
  const { data, error } = await supabase
    .from("author_claims")
    .select("id")
    .eq("author_id", authorId)
    .eq("user_id", userId)
    .eq("status", "approved")
    .maybeSingle()

  if (error) return false

  return !!data
}