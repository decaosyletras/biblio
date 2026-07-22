import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
)

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i


export async function POST(
  request: Request
) {

  try {

    const supabase =
      await createClient()


    const {
      data: {
        user
      }
    } =
      await supabase.auth.getUser()


    if (!user) {

      return NextResponse.json(
        {
          error: "No autenticado"
        },
        {
          status: 401
        }
      )

    }


    const origin = request.headers.get("origin")
    const requestOrigin = new URL(request.url).origin

    if (origin && origin !== requestOrigin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const contentLength = Number(
      request.headers.get("content-length") ?? 0
    )

    if (contentLength > 5000) {
      return NextResponse.json(
        { error: "Solicitud demasiado grande" },
        { status: 413 }
      )
    }

    try {
      const allowed = await enforceRateLimit({
        request,
        namespace: "stripe-portal",
        subject: user.id,
        limit: 20,
        windowSeconds: 10 * 60,
      })

      if (!allowed) {
        return NextResponse.json(
          { error: "Demasiados intentos. Intenta nuevamente mas tarde." },
          { status: 429 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: "No se pudo validar la solicitud" },
        { status: 500 }
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
      )
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
      )
    }


    const {
      authorId
    } = body as Record<string, unknown>

    if (
      typeof authorId !== "string" ||
      !UUID_PATTERN.test(authorId)
    ) {
      return NextResponse.json(
        { error: "Datos invalidos" },
        { status: 400 }
      )
    }



    /*
     * Implementacion anterior conservada como referencia.
     * Se comento porque consultaba author_payments con el cliente de sesion.
    const {
      data: payment
    } =
      await supabase
        .from("author_payments")
        .select(
          "stripe_customer_id"
        )
        .eq(
          "author_id",
          authorId
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .maybeSingle()
    */

    const {
      data: payment,
      error: paymentError
    } =
      await supabaseAdmin
        .from("author_payments")
        .select(
          "stripe_customer_id"
        )
        .eq(
          "author_id",
          authorId
        )
        .eq(
          "user_id",
          user.id
        )
        // Se comento porque limitar el portal a active impedia que un cliente
        // con pago en recuperacion actualizara su metodo de pago.
        // .eq(
        //   "status",
        //   "active"
        // )
        .in(
          "status",
          [
            "active",
            "trialing",
            "past_due"
          ]
        )
        .maybeSingle()

    if (paymentError) {
      return NextResponse.json(
        {
          error: "No se pudo verificar la suscripcion"
        },
        {
          status: 500
        }
      )
    }



    if (
      !payment?.stripe_customer_id
    ) {

      return NextResponse.json(
        {
          error:
            "No existe suscripción activa"
        },
        {
          status: 400
        }
      )

    }



    const session =
      await stripe.billingPortal.sessions.create({

        customer:
          payment.stripe_customer_id,

        return_url:
          `${process.env.NEXT_PUBLIC_SITE_URL}/authors`

      })


    return NextResponse.json({
      url: session.url
    })


  // Se comento el tipo any porque el error no debe confiarse ni exponerse.
  // } catch (error: any) {
  } catch {

    return NextResponse.json(
      {
        // Se comento para no devolver detalles internos del proveedor.
        // error: error.message
        error: "No se pudo abrir la gestion PRO"
      },
      {
        status: 500
      }
    )

  }

}
