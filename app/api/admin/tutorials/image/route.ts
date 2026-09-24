import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import sharp from "sharp"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getTutorialImageUrl, isTutorialSlug } from "@/lib/tutorials"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_INPUT_BYTES = 5 * 1024 * 1024
const MAX_OUTPUT_BYTES = 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

async function optimizeImage(bytes: Buffer) {
  const image = sharp(bytes, {
    animated: false,
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })

  for (const quality of [84, 76, 68, 60]) {
    const output = await image.clone().webp({ quality, effort: 4 }).toBuffer()
    if (output.byteLength <= MAX_OUTPUT_BYTES) return output
  }

  return null
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin")
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0)
    if (contentLength > MAX_INPUT_BYTES + 100_000) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande" },
        { status: 413 }
      )
    }

    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("admin")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile?.admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const allowed = await enforceRateLimit({
      request,
      namespace: "admin-tutorial-image",
      subject: user.id,
      limit: 30,
      windowSeconds: 60,
    })

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas imágenes. Espera un minuto." },
        { status: 429 }
      )
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    const slug = formData.get("slug")
    const image = formData.get("image")

    if (
      typeof slug !== "string" ||
      !isTutorialSlug(slug) ||
      !(image instanceof File) ||
      image.size === 0 ||
      image.size > MAX_INPUT_BYTES ||
      !ALLOWED_TYPES.has(image.type)
    ) {
      return NextResponse.json(
        { error: "Usa una imagen JPG, PNG o WebP de hasta 5 MB" },
        { status: 400 }
      )
    }

    let optimized: Buffer | null
    try {
      optimized = await optimizeImage(Buffer.from(await image.arrayBuffer()))
    } catch {
      return NextResponse.json(
        { error: "No se pudo procesar la imagen" },
        { status: 400 }
      )
    }

    if (!optimized) {
      return NextResponse.json(
        { error: "No se pudo reducir la imagen a un tamaño seguro" },
        { status: 422 }
      )
    }

    const imagePath = `${slug}/${randomUUID()}.webp`
    const { error: uploadError } = await supabaseAdmin.storage
      .from("tutorial-images")
      .upload(imagePath, optimized, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "No se pudo guardar la imagen" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imagePath,
      imageUrl: getTutorialImageUrl(imagePath),
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen" },
      { status: 500 }
    )
  }
}
