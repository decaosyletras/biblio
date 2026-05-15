import { headers } from "next/headers"

export async function GET() {
  const h = await headers()

  // Vercel / Cloudflare / proxies comunes
  const country =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    "US"

  return Response.json({
    country: country.toUpperCase(),
  })
}