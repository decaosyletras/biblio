import { NextResponse } from "next/server"

/*
 * Endpoint heredado retirado.
 *
 * El formulario vigente registra libros mediante /api/libro-nuevo. Esta ruta
 * se conserva temporalmente para que cualquier cliente antiguo reciba una
 * respuesta explicita sin ejecutar escrituras con el cliente administrativo.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Este endpoint fue retirado",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
