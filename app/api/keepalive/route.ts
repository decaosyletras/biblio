import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Buscar último registro
  const { data: lastRow, error: fetchError } = await supabase
    .from('heartbeat')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return NextResponse.json(
      { success: false, error: fetchError.message },
      { status: 500 }
    )
  }

  let shouldInsert = false

  if (!lastRow) {
    // No existe ningún registro
    shouldInsert = true
  } else {
    const lastInsert = new Date(lastRow.created_at).getTime()
    const now = Date.now()

    const hoursPassed = (now - lastInsert) / (1000 * 60 * 60)

    if (hoursPassed >= 0.08) {
      shouldInsert = true
    }
  }

  if (shouldInsert) {
    const { error: insertError } = await supabase
      .from('heartbeat')
      .insert({})

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action: 'inserted'
    })
  }

  return NextResponse.json({
    ok: true,
    time: new Date().toISOString()
  })
}