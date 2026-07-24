import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
)

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  quarterly: process.env.STRIPE_PRICE_QUARTERLY!,
  semiannual: process.env.STRIPE_PRICE_SEMIANNUAL!
}

type AuthorRelation =
  | {
    slug?: string | null
  }
  | Array<{
    slug?: string | null
  }>
  | null

type Plan = keyof typeof PRICE_IDS

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPlan(value: unknown): value is Plan {
  return value === "monthly" ||
    value === "quarterly" ||
    value === "semiannual"
}

type CheckoutAttempt = {
  author_id: string
  user_id: string
  plan: string
  idempotency_key: string
  stripe_session_id: string | null
  status: string
  expires_at: string
}

class CheckoutInProgressError extends Error { }

async function prepareCheckoutAttempt(
  authorId: string,
  userId: string,
  plan: string,
  retryCount = 0
): Promise<{
  idempotencyKey: string
  existingUrl?: string
}> {
  if (retryCount > 3) {
    throw new Error("checkout_attempt_conflict")
  }

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("stripe_checkout_attempts")
    .select(
      "author_id,user_id,plan,idempotency_key,stripe_session_id,status,expires_at"
    )
    .eq("author_id", authorId)
    .maybeSingle()

  if (lookupError) {
    throw new Error("checkout_attempt_lookup_failed")
  }

  if (existing) {
    const attempt = existing as CheckoutAttempt

    if (attempt.stripe_session_id) {
      const previousSession = await stripe.checkout.sessions.retrieve(
        attempt.stripe_session_id
      )

      if (previousSession.status === "open" && previousSession.url) {
        if (attempt.user_id !== userId || attempt.plan !== plan) {
          throw new CheckoutInProgressError()
        }

        return {
          idempotencyKey: attempt.idempotency_key,
          existingUrl: previousSession.url,
        }
      }

      if (previousSession.status === "complete") {
        throw new CheckoutInProgressError()
      }
    }

    const pendingAttemptIsCurrent =
      !attempt.stripe_session_id &&
      attempt.status === "pending" &&
      new Date(attempt.expires_at).getTime() > Date.now()

    if (pendingAttemptIsCurrent) {
      if (attempt.user_id !== userId || attempt.plan !== plan) {
        throw new CheckoutInProgressError()
      }

      return {
        idempotencyKey: attempt.idempotency_key,
      }
    }

    const newIdempotencyKey = crypto.randomUUID()
    const { data: rotatedAttempt, error: rotateError } = await supabaseAdmin
      .from("stripe_checkout_attempts")
      .update({
        user_id: userId,
        plan,
        idempotency_key: newIdempotencyKey,
        stripe_session_id: null,
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("author_id", authorId)
      .eq("idempotency_key", attempt.idempotency_key)
      .select("idempotency_key")
      .maybeSingle()

    if (rotateError) {
      throw new Error("checkout_attempt_rotation_failed")
    }

    if (!rotatedAttempt) {
      return prepareCheckoutAttempt(
        authorId,
        userId,
        plan,
        retryCount + 1
      )
    }

    return {
      idempotencyKey: rotatedAttempt.idempotency_key,
    }
  }

  const idempotencyKey = crypto.randomUUID()
  const { error: insertError } = await supabaseAdmin
    .from("stripe_checkout_attempts")
    .insert({
      author_id: authorId,
      user_id: userId,
      plan,
      idempotency_key: idempotencyKey,
      status: "pending",
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })

  if (insertError?.code === "23505") {
    return prepareCheckoutAttempt(
      authorId,
      userId,
      plan,
      retryCount + 1
    )
  }

  if (insertError) {
    throw new Error("checkout_attempt_creation_failed")
  }

  return { idempotencyKey }
}

export async function POST(request: Request) {

  try {

    const supabase = await createClient()

    const {
      data: {
        user
      }
    } = await supabase.auth.getUser()

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
        {
          error: "Solicitud no autorizada"
        },
        {
          status: 403
        }
      )
    }

    const contentLength = Number(
      request.headers.get("content-length") ?? 0
    )

    if (contentLength > 10000) {
      return NextResponse.json(
        {
          error: "Solicitud demasiado grande"
        },
        {
          status: 413
        }
      )
    }

    try {
      const allowed = await enforceRateLimit({
        request,
        namespace: "stripe-checkout",
        subject: user.id,
        limit: 10,
        windowSeconds: 10 * 60,
      })

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Demasiados intentos. Intenta nuevamente mas tarde."
          },
          {
            status: 429
          }
        )
      }
    } catch {
      return NextResponse.json(
        {
          error: "No se pudo validar la solicitud"
        },
        {
          status: 500
        }
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: "Solicitud invalida"
        },
        {
          status: 400
        }
      )
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Solicitud invalida"
        },
        {
          status: 400
        }
      )
    }

    const {
      authorId,
      plan
    } = body as Record<string, unknown>

    if (
      typeof authorId !== "string" ||
      !UUID_PATTERN.test(authorId) ||
      !isPlan(plan)
    ) {

      return NextResponse.json(
        {
          error: "Faltan datos"
        },
        {
          status: 400
        }
      )

    }

    const priceId = PRICE_IDS[plan]

    if (!priceId) {

      return NextResponse.json(
        {
          error: "Plan inválido"
        },
        {
          status: 400
        }
      )

    }

    const {
      data: claim
    } = await supabase
      .from("author_claims")
      .select(`
        id,
        authors(
          slug
        )
      `)
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
        "approved"
      )
      .maybeSingle()

    if (!claim) {

      return NextResponse.json(
        {
          error:
            "No tienes permiso sobre este autor"
        },
        {
          status: 403
        }
      )

    }

    // Se comento porque author_payments ya no debe ser legible directamente
    // por clientes autenticados. La identidad y propiedad ya se validaron.
    // const { data: existingPayment } =
    //   await supabase
    const { data: existingPayment, error: existingPaymentError } =
      await supabaseAdmin
        .from("author_payments")
        .select(
          "stripe_subscription_id,status"
        )
        .eq(
          "author_id",
          authorId
        )
        .in(
          "status",
          [
            "active",
            "trialing",
            "past_due"
          ]
        )
        .not(
          "stripe_subscription_id",
          "is",
          null
        )
        .maybeSingle()

    if (existingPaymentError) {
      return NextResponse.json(
        {
          error: "No se pudo verificar la suscripcion"
        },
        {
          status: 500
        }
      )
    }

    if (existingPayment?.stripe_subscription_id) {

      const subscription =
        await stripe.subscriptions.retrieve(
          existingPayment.stripe_subscription_id
        )

      const activeStatuses = [
        "active",
        "trialing",
        "past_due"
      ]

      if (
        activeStatuses.includes(
          subscription.status
        )
      ) {

        return NextResponse.json(
          {
            error:
              "Este autor ya tiene una suscripción PRO activa"
          },
          {
            status: 400
          }
        )

      }

    }

    // Se comento porque any evitaba validar la forma real de la relacion.
    // const authorSlug = (claim.authors as any)?.slug
    const authors = claim.authors as unknown as AuthorRelation
    const author = Array.isArray(authors) ? authors[0] : authors
    const authorSlug = author?.slug


    if (!authorSlug) {

      return NextResponse.json(
        {
          error: "Autor inválido"
        },
        {
          status: 400
        }
      )

    }

    const attempt = await prepareCheckoutAttempt(
      authorId,
      user.id,
      plan
    )

    if (attempt.existingUrl) {
      return NextResponse.json({
        url: attempt.existingUrl
      })
    }

    const {
      data: customerPayments,
      error: customerLookupError
    } = await supabaseAdmin
      .from("author_payments")
      .select("stripe_customer_id")
      .eq("author_id", authorId)
      .not("stripe_customer_id", "is", null)
      .limit(1)

    if (customerLookupError) {
      throw new Error("stripe_customer_lookup_failed")
    }

    const customerId =
      customerPayments?.[0]?.stripe_customer_id ?? null

    const session =
      await stripe.checkout.sessions.create({

        mode: "subscription",

        payment_method_types: [
          "card"
        ],

        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],

        allow_promotion_codes: true,

        // Se comento porque crear un cliente nuevo en cada intento fragmentaba
        // el historial y el portal de facturacion.
        // customer_email: user.email ?? undefined,
        ...(customerId
          ? {
            customer: customerId
          }
          : {
            customer_email: user.email ?? undefined
          }),


        metadata: {
          author_id: authorId,
          user_id: user.id,
          plan
        },


        subscription_data: {
          metadata: {
            author_id: authorId,
            user_id: user.id
          }
        },


        success_url:
          `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${authorSlug}?payment=success`,

        cancel_url:
          `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${authorSlug}?payment=cancelled`

      }, {
        idempotencyKey: attempt.idempotencyKey
      })

    if (!session.url) {
      throw new Error("checkout_url_missing")
    }

    const {
      data: updatedAttempt,
      error: attemptUpdateError
    } = await supabaseAdmin
      .from("stripe_checkout_attempts")
      .update({
        stripe_session_id: session.id,
        status: "created",
        expires_at: new Date(session.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("author_id", authorId)
      .eq("idempotency_key", attempt.idempotencyKey)
      .select("author_id")
      .maybeSingle()

    if (attemptUpdateError || !updatedAttempt) {
      try {
        await stripe.checkout.sessions.expire(session.id)
      } catch {
        // Stripe will still reuse the same idempotency key for this attempt.
      }

      throw new Error("checkout_attempt_update_failed")
    }


    return NextResponse.json({
      url: session.url
    })


    // Se comento el tipo any porque el error no debe confiarse ni exponerse.
    // } catch (error: any) {
  } catch (error: unknown) {

    if (error instanceof CheckoutInProgressError) {
      return NextResponse.json(
        {
          error: "Ya existe un pago en proceso para este autor"
        },
        {
          status: 409
        }
      )
    }

    // Se comento porque podia registrar detalles internos de Stripe.
    // console.error("Stripe checkout error:", error)
    console.error("Stripe checkout request failed", error)


    return NextResponse.json(
      {
        // Se comento para no exponer mensajes internos del proveedor.
        // error: error.message ?? "Error creando checkout"
        error: "Error creando checkout"
      },
      {
        status: 500
      }
    )

  }

}
