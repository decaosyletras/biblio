import { headers } from "next/headers"

export async function GET() {
  const h = await headers()

  const country =
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    "US"

  const safe = country.toUpperCase()

  // 🔥 IMPORTANTE: whitelist
  const allowed = ["US", "ES", "MX"]

  return Response.json({
    country: allowed.includes(safe) ? safe : "US",
  })
}