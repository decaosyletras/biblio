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

/*
 * Implementacion anterior conservada como referencia.
 * Se comento porque no comprobaba errores de base de datos, no registraba
 * eventos procesados y podia aplicar eventos duplicados o fuera de orden.
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
*/

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type EventStartResult = "process" | "completed" | "busy"

function getPlan(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id

  if (priceId === process.env.STRIPE_PRICE_MONTHLY) {
    return "monthly"
  }

  if (priceId === process.env.STRIPE_PRICE_QUARTERLY) {
    return "quarterly"
  }

  if (priceId === process.env.STRIPE_PRICE_SEMIANNUAL) {
    return "semiannual"
  }

  return null
}

function getCustomerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  return typeof invoice.parent?.subscription_details?.subscription === "string"
    ? invoice.parent.subscription_details.subscription
    : null
}

async function startEvent(event: Stripe.Event): Promise<EventStartResult> {
  const { error: insertError } = await supabaseAdmin
    .from("stripe_events")
    .insert({
      event_id: event.id,
      event_type: event.type,
      stripe_created_at: new Date(event.created * 1000).toISOString(),
      status: "processing",
      processed_at: new Date().toISOString(),
    })

  if (!insertError) {
    return "process"
  }

  if (insertError.code !== "23505") {
    throw new Error("event_registration_failed")
  }

  const { data: existingEvent, error: existingEventError } =
    await supabaseAdmin
      .from("stripe_events")
      .select("status,created_at,processed_at")
      .eq("event_id", event.id)
      .maybeSingle()

  if (existingEventError || !existingEvent) {
    throw new Error("event_lookup_failed")
  }

  if (existingEvent.status === "completed") {
    return "completed"
  }

  const processingRecently =
    existingEvent.status === "processing" &&
    Date.now() - new Date(
      existingEvent.processed_at ?? existingEvent.created_at
    ).getTime() < 5 * 60 * 1000

  if (processingRecently) {
    return "busy"
  }

  const { error: retryError } = await supabaseAdmin
    .from("stripe_events")
    .update({
      status: "processing",
      processed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("event_id", event.id)

  if (retryError) {
    throw new Error("event_retry_failed")
  }

  return "process"
}

async function completeEvent(eventId: string) {
  const { error } = await supabaseAdmin
    .from("stripe_events")
    .update({
      status: "completed",
      processed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("event_id", eventId)

  if (error) {
    throw new Error("event_completion_failed")
  }
}

async function failEvent(eventId: string) {
  await supabaseAdmin
    .from("stripe_events")
    .update({
      status: "failed",
      processed_at: new Date().toISOString(),
      error_message: "processing_failed",
    })
    .eq("event_id", eventId)
}

async function retrieveCurrentSubscription(
  subscriptionId: string,
  deletedFallback?: Stripe.Subscription
) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch {
    if (deletedFallback?.status === "canceled") {
      return deletedFallback
    }

    throw new Error("subscription_lookup_failed")
  }
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  event: Stripe.Event,
  session?: Stripe.Checkout.Session
) {
  const authorId = subscription.metadata.author_id
  const userId = subscription.metadata.user_id
  const plan = getPlan(subscription)

  if (
    !authorId ||
    !userId ||
    !UUID_PATTERN.test(authorId) ||
    !UUID_PATTERN.test(userId) ||
    !plan
  ) {
    throw new Error("invalid_subscription_metadata")
  }

  const customerId = getCustomerId(subscription)
  const currentPeriodEnd = getPeriodEnd(subscription)
  const paymentRecord: Record<string, unknown> = {
    author_id: authorId,
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan,
    status: subscription.status,
    currency: session?.currency ?? subscription.currency ?? "usd",
    current_period_end: currentPeriodEnd,
  }

  if (session) {
    paymentRecord.stripe_session_id = session.id
    paymentRecord.stripe_payment_intent_id = null
    paymentRecord.amount = session.amount_total ?? 0
  }

  const { error: paymentError } = await supabaseAdmin
    .from("author_payments")
    .upsert(
      paymentRecord,
      {
        onConflict: "stripe_subscription_id",
      }
    )

  if (paymentError) {
    throw new Error("payment_sync_failed")
  }

  const grantsPro =
    subscription.status === "active" ||
    subscription.status === "trialing"

  const { error: authorError } = await supabaseAdmin
    .from("authors")
    .update({
      pro: grantsPro,
      pro_until: grantsPro ? currentPeriodEnd : null,
    })
    .eq("id", authorId)

  if (authorError) {
    throw new Error("author_sync_failed")
  }

  if (session) {
    const { error: attemptError } = await supabaseAdmin
      .from("stripe_checkout_attempts")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session.id)

    if (attemptError) {
      throw new Error("checkout_attempt_sync_failed")
    }
  }

  void event
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new NextResponse("Invalid signature", { status: 400 })
  }

  let startResult: EventStartResult

  try {
    startResult = await startEvent(event)
  } catch {
    return NextResponse.json(
      { received: false },
      { status: 500 }
    )
  }

  if (startResult === "completed") {
    return NextResponse.json({ received: true, duplicate: true })
  }

  if (startResult === "busy") {
    return NextResponse.json(
      { received: false },
      { status: 409 }
    )
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id

      if (!subscriptionId) {
        throw new Error("missing_subscription")
      }

      const subscription =
        await retrieveCurrentSubscription(subscriptionId)

      await syncSubscription(subscription, event, session)
    }

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const subscriptionId =
        getInvoiceSubscriptionId(event.data.object)

      if (subscriptionId) {
        const subscription =
          await retrieveCurrentSubscription(subscriptionId)

        await syncSubscription(subscription, event)
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const eventSubscription = event.data.object as Stripe.Subscription
      const subscription = await retrieveCurrentSubscription(
        eventSubscription.id,
        event.type === "customer.subscription.deleted"
          ? eventSubscription
          : undefined
      )

      await syncSubscription(subscription, event)
    }

    await completeEvent(event.id)

    return NextResponse.json({ received: true })
  } catch {
    await failEvent(event.id)

    return NextResponse.json(
      { received: false },
      { status: 500 }
    )
  }
}
