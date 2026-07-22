import "server-only"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

type RateLimitOptions = {
  request: Request
  namespace: string
  limit: number
  windowSeconds: number
  subject?: string | null
}

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")

  return forwarded
    ? forwarded.split(",")[0].trim()
    : "unknown"
}

export async function enforceRateLimit({
  request,
  namespace,
  limit,
  windowSeconds,
  subject,
}: RateLimitOptions) {
  const identity = subject?.trim() || getClientAddress(request)
  const rateKey = [namespace, identity].join(":").slice(0, 255)

  const { data, error } = await supabaseAdmin.rpc(
    "consume_rate_limit",
    {
      p_key: rateKey,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    }
  )

  if (error || data !== true) {
    if (error) {
      throw new Error("rate_limit_check_failed")
    }

    return false
  }

  return true
}
