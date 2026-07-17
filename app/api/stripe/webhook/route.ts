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

function getPeriodEnd(
  subscription: Stripe.Subscription
) {

  const item =
    subscription.items.data[0]

  if (!item?.current_period_end) {
    return null
  }

  return new Date(
    item.current_period_end * 1000
  ).toISOString()

}

export async function POST(
  request: Request
) {

  const body =
    await request.text()

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

  } catch {

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

    const session = event.data.object


    const authorId =
      session.metadata?.author_id

    const userId =
      session.metadata?.user_id

    const plan =
      session.metadata?.plan

    if (
      !authorId ||
      !userId ||
      !session.subscription
    ) {

      return NextResponse.json({
        received: true
      })

    }

    const subscription =
      await stripe.subscriptions.retrieve(
        session.subscription as string
      )

    console.log({
      sessionId: session.id,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata,
      plan
    })

    await supabaseAdmin
      .from("author_payments")
      .upsert(
        {
          author_id: authorId,
          user_id: userId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_payment_intent_id: null,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          plan,
          status: "active",
          current_period_end: getPeriodEnd(subscription)
        },
        {
          onConflict: "stripe_session_id"
        }
      )

    await supabaseAdmin
      .from("authors")
      .update({
        pro: true,
        pro_until: getPeriodEnd(subscription)
      })
      .eq(
        "id",
        authorId
      )

  }

  if (
    event.type ===
    "invoice.payment_succeeded"
  ) {

    const invoice = event.data.object

    const subscriptionId =
      typeof invoice.parent?.subscription_details?.subscription === "string"
        ? invoice.parent.subscription_details.subscription
        : null

    if (subscriptionId) {

      const subscription =
        await stripe.subscriptions.retrieve(
          subscriptionId
        )

      const authorId =
        subscription.metadata.author_id

      if (authorId) {

        await supabaseAdmin
          .from("author_payments")
          .update({

            status:
              "active",

            current_period_end:
              getPeriodEnd(subscription)

          })
          .eq(
            "stripe_subscription_id",
            subscription.id
          )

        await supabaseAdmin
          .from("authors")
          .update({
            pro: true,
            pro_until: getPeriodEnd(subscription)
          })
          .eq(
            "id",
            authorId
          )

      }

    }

  }

  if (
    event.type ===
    "invoice.payment_failed"
  ) {

    const invoice = event.data.object

    const subscriptionId =
      typeof invoice.parent?.subscription_details?.subscription === "string"
        ? invoice.parent.subscription_details.subscription
        : null

    if (subscriptionId) {

      await supabaseAdmin
        .from("author_payments")
        .update({
          status: "past_due"
        })
        .eq(
          "stripe_subscription_id",
          subscriptionId
        )

    }

  }

  if (
    event.type === "customer.subscription.updated"
  ) {

    const subscription =
      event.data.object as Stripe.Subscription

    const authorId =
      subscription.metadata?.author_id

    if (authorId) {

      const priceId =
        subscription.items.data[0]?.price.id

      let plan = null

      if (priceId === process.env.STRIPE_PRICE_MONTHLY) {
        plan = "monthly"
      }

      if (priceId === process.env.STRIPE_PRICE_QUARTERLY) {
        plan = "quarterly"
      }

      if (priceId === process.env.STRIPE_PRICE_SEMIANNUAL) {
        plan = "semiannual"
      }

      const currentPeriodEnd =
        subscription.items.data[0]?.current_period_end

      await supabaseAdmin
        .from("author_payments")
        .update({

          status:
            subscription.status,

          plan,

          current_period_end:
            currentPeriodEnd
              ? new Date(
                currentPeriodEnd * 1000
              ).toISOString()
              : null

        })
        .eq(
          "stripe_subscription_id",
          subscription.id
        )


      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing"

      await supabaseAdmin
        .from("authors")
        .update({

          pro:
            isActive,

          pro_until:
            currentPeriodEnd
              ? new Date(
                currentPeriodEnd * 1000
              ).toISOString()
              : null

        })
        .eq(
          "id",
          authorId
        )

    }

  }

  if (
    event.type ===
    "customer.subscription.deleted"
  ) {

    const subscription = event.data.object

    const authorId =
      subscription.metadata.author_id

    if (authorId) {

      await supabaseAdmin
        .from("author_payments")
        .update({
          status: "cancelled"
        })
        .eq(
          "stripe_subscription_id",
          subscription.id
        )

      await supabaseAdmin
        .from("authors")
        .update({
          pro: false,
          pro_until: null
        })
        .eq(
          "id",
          authorId
        )

    }

  }

  return NextResponse.json({
    received: true
  })

}