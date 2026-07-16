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


    const body =
      await request.json()


    const {
      authorId
    } = body



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