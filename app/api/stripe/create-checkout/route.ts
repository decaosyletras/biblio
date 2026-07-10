import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
)

export async function POST(
  request: Request
) {
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

    const authorId = body.authorId

    if (!authorId) {
      return NextResponse.json(
        {
          error: "Falta authorId"
        },
        {
          status: 400
        }
      )
    }

    const { data: claim } = await supabase
      .from("author_claims")
      .select(`
        id,
        authors (
            slug
        )
    `)
      .eq("author_id", authorId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .maybeSingle()

    if (!claim) {
      return NextResponse.json(
        {
          error: "No tienes permiso sobre este autor"
        },
        {
          status: 403
        }
      )
    }

    const authorSlug =
      (claim.authors as any)?.slug

    if (!authorSlug) {
      return NextResponse.json(
        {
          error: "No se encontró slug del autor"
        },
        {
          status: 400
        }
      )
    }

    const session =
      await stripe.checkout.sessions.create({

        mode: "payment",

        payment_method_types: [
          "card"
        ],

        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Página PRO de autor"
              },
              unit_amount: 400,
            },
            quantity: 1
          }
        ],

        success_url:
          `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${authorSlug}?payment=success&t=${Date.now()}`,

        cancel_url:
          `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${authorSlug}?payment=cancelled`,

        metadata: {
          author_id: authorId,
          user_id: user.id
        }
      })


    return NextResponse.json({
      url: session.url
    })

  } catch (error: any) {

    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 500
      }
    )
  }
}