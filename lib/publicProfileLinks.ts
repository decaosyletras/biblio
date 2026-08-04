import "server-only"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export type LinkedAuthorProfile = {
  name: string
  slug: string
}

export type LinkedReaderProfile = {
  displayName: string
  username: string
}

export async function getLinkedAuthorForPublicReader(
  username: string
): Promise<LinkedAuthorProfile | null> {
  const { data: readerProfile, error: readerError } = await supabaseAdmin
    .from("reader_profiles")
    .select("user_id")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle()

  if (readerError || !readerProfile?.user_id) return null

  const { data: claim, error: claimError } = await supabaseAdmin
    .from("author_claims")
    .select("author_id")
    .eq("user_id", readerProfile.user_id)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (claimError || !claim?.author_id) return null

  const { data: author, error: authorError } = await supabaseAdmin
    .from("authors")
    .select("name, slug")
    .eq("id", claim.author_id)
    .maybeSingle()

  if (authorError || !author?.name || !author?.slug) return null

  // Los ids internos sólo enlazan las tablas dentro del servidor. La página
  // recibe exclusivamente los datos públicos que necesita para construir el link.
  return {
    name: author.name,
    slug: author.slug,
  }
}

export async function getLinkedPublicReaderForAuthor(
  authorId: string
): Promise<LinkedReaderProfile | null> {
  const { data: claim, error: claimError } = await supabaseAdmin
    .from("author_claims")
    .select("user_id")
    .eq("author_id", authorId)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (claimError || !claim?.user_id) return null

  const { data: readerProfile, error: readerError } = await supabaseAdmin
    .from("reader_profiles")
    .select("display_name, username")
    .eq("user_id", claim.user_id)
    .eq("is_public", true)
    .maybeSingle()

  if (
    readerError ||
    !readerProfile?.display_name ||
    !readerProfile?.username
  ) {
    return null
  }

  return {
    displayName: readerProfile.display_name,
    username: readerProfile.username,
  }
}
