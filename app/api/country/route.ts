import { headers } from "next/headers"

export async function GET() {

  const headersList = await headers()

  const country =
    headersList.get("x-vercel-ip-country") || "US"

  return Response.json({
    country,
  })
}