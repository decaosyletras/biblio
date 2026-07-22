import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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

    const body = await request.json()

    const {
      authorId,
      plan
    } = body

    if (!authorId || !plan) {

      return NextResponse.json(
        {
          error: "Faltan datos"
        },
        {
          status: 400
        }
      )

    }

    const priceId =
      PRICE_IDS[
      plan as keyof typeof PRICE_IDS
      ]

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

        customer_email:
          user.email ?? undefined,


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

      })


    return NextResponse.json({
      url: session.url
    })


  // Se comento el tipo any porque el error no debe confiarse ni exponerse.
  // } catch (error: any) {
  } catch (error: unknown) {

    console.error(
      "Stripe checkout error:",
      error
    )

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
