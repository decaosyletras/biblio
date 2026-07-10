import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"


const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
)


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(
  request: Request
) {

  const body = await request.text()

  const signature =
    request.headers.get(
      "stripe-signature"
    )


  if (!signature) {
    return new NextResponse(
      "Missing signature",
      {
        status: 400
      }
    )
  }


  let event: Stripe.Event


  try {

    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

  } catch (error) {
    return new NextResponse(
      "Invalid signature",
      {
        status: 400
      }
    )
  }


  if (
    event.type ===
    "checkout.session.completed"
  ) {

    const session =
      event.data.object as Stripe.Checkout.Session


    const authorId =
      session.metadata?.author_id


    const userId =
      session.metadata?.user_id


    if (
      !authorId ||
      !userId
    ) {
      return NextResponse.json({
        error: "Missing metadata"
      })
    }


    await supabaseAdmin
      .from("author_payments")
      .upsert({

        author_id: authorId,

        user_id: userId,

        stripe_session_id:
          session.id,

        stripe_payment_intent_id:
          session.payment_intent as string,

        amount:
          session.amount_total ?? 400,

        currency:
          session.currency ?? "usd",

        status:
          "paid"
      })


    await supabaseAdmin
      .from("authors")
      .update({
        pro: true
      })
      .eq(
        "id",
        authorId
      )

  }


  return NextResponse.json({
    received: true
  })

}