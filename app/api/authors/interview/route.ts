import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type InterviewQuestion = {
  id: string
  answer: string
  isVisible: boolean
}

async function getAuthorizedAuthor(authorId: string) {
  const authClient = await createClient()
  const { data: { user }, error } = await authClient.auth.getUser()

  if (error || !user) return null

  const { data: claim } = await supabaseAdmin
    .from("author_claims")
    .select("id")
    .eq("author_id", authorId)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle()

  return claim ? user : null
}

export async function GET(request: Request) {
  const authorId = new URL(request.url).searchParams.get("authorId")

  if (!authorId || !UUID_PATTERN.test(authorId)) {
    return NextResponse.json({ error: "Autor inválido" }, { status: 400 })
  }

  if (!await getAuthorizedAuthor(authorId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { data: catalog, error: catalogError } = await supabaseAdmin
    .from("interview_questions")
    .select("id, question, sort_order")
    .eq("is_active", true)
    .order("sort_order")

  const { data: answers, error: answersError } = await supabaseAdmin
    .from("author_interview_answers")
    .select("question_id, answer, is_visible")
    .eq("author_id", authorId)

  if (catalogError || answersError) {
    return NextResponse.json({ error: "No se pudo cargar la entrevista" }, { status: 500 })
  }

  const answersByQuestion = new Map(
    (answers ?? []).map(answer => [answer.question_id, answer])
  )

  const questions = (catalog ?? []).map(question => ({
    ...question,
    answer: answersByQuestion.get(question.id)?.answer ?? "",
    is_visible: answersByQuestion.get(question.id)?.is_visible ?? false
  }))

  return NextResponse.json({ questions })
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { authorId?: unknown }).authorId !== "string" ||
    !UUID_PATTERN.test((body as { authorId: string }).authorId) ||
    typeof (body as { showInterview?: unknown }).showInterview !== "boolean" ||
    !Array.isArray((body as { questions?: unknown }).questions) ||
    (body as { questions: unknown[] }).questions.length > 20
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { authorId, showInterview, questions: rawQuestions } = body as {
    authorId: string
    showInterview: boolean
    questions: unknown[]
  }

  if (!await getAuthorizedAuthor(authorId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const questions = rawQuestions as InterviewQuestion[]
  const hasInvalidQuestion = questions.some(question =>
    typeof question.id !== "string" ||
    !UUID_PATTERN.test(question.id) ||
    typeof question.answer !== "string" ||
    question.answer.length > 700 ||
    typeof question.isVisible !== "boolean"
  )

  if (hasInvalidQuestion) {
    return NextResponse.json({ error: "Pregunta inválida" }, { status: 400 })
  }

  const hasVisibleAnswer = questions.some(
    (question) => question.isVisible === true &&
      typeof question.answer === "string" &&
      question.answer.trim() !== ""
  )

  if (showInterview && !hasVisibleAnswer) {
    return NextResponse.json(
      { error: "Responde y muestra al menos una pregunta antes de publicar la sección." },
      { status: 400 }
    )
  }

  const questionIds = questions.map(question => question.id)
  const { data: validQuestions, error: questionsError } = questionIds.length > 0
    ? await supabaseAdmin
      .from("interview_questions")
      .select("id")
      .in("id", questionIds)
      .eq("is_active", true)
    : { data: [], error: null }

  if (
    questionsError ||
    (validQuestions ?? []).length !== new Set(questionIds).size
  ) {
    return NextResponse.json({ error: "El formulario contiene preguntas inválidas" }, { status: 400 })
  }

  for (const question of questions) {
    const answer = question.answer.trim()

    if (answer === "") {
      const { error } = await supabaseAdmin
        .from("author_interview_answers")
        .delete()
        .eq("author_id", authorId)
        .eq("question_id", question.id)

      if (error) {
        return NextResponse.json({ error: "No se pudo guardar la entrevista" }, { status: 500 })
      }

      continue
    }

    const { error } = await supabaseAdmin
      .from("author_interview_answers")
      .upsert(
        {
          author_id: authorId,
          question_id: question.id,
          answer,
          is_visible: question.isVisible,
          updated_at: new Date().toISOString()
        },
        { onConflict: "author_id,question_id" }
      )

    if (error) {
      return NextResponse.json({ error: "No se pudo guardar la entrevista" }, { status: 500 })
    }
  }

  const { error } = await supabaseAdmin
    .from("authors")
    .update({ show_interview: showInterview })
    .eq("id", authorId)

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la visibilidad" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
