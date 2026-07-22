import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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
        .eq(
          "status",
          "active"
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
