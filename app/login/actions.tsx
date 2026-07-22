"use server"

import { createClient } from "@/lib/supabase-server"

export async function loginAction(
  email: string,
  password: string
) {
  const supabase = await createClient()

  // Se comento porque data no se utilizaba y generaba una advertencia; para
  // este flujo solo hace falta saber si Supabase devolvio un error.
  // const { data, error } =
  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    })

  if (error) {
    return {
      // Se comento para no devolver al navegador mensajes internos del
      // proveedor, que podrian revelar detalles innecesarios del login.
      // error: error.message
      error: "Correo o contraseña incorrectos"
    }
  }

  return {
    error: null
  }
}
