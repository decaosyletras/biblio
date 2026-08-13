"use client"

import { Eye, EyeOff, MessageCircle } from "lucide-react"

type Question = {
  id: string
  question: string
  answer: string
  is_visible: boolean
}

type Props = {
  questions: Question[]
  showInterview: boolean
  onShowInterviewChange: (value: boolean) => void
  onQuestionChange: (id: string, updates: Partial<Question>) => void
}

export default function AuthorInterviewSection({
  questions,
  showInterview,
  onShowInterviewChange,
  onQuestionChange
}: Props) {
  const visibleAnswerCount = questions.filter(
    question => question.is_visible && question.answer.trim() !== ""
  ).length
  const hasVisibleAnswer = visibleAnswerCount > 0
  const isPublished = showInterview && hasVisibleAnswer

  function updateAnswer(question: Question, answer: string) {
    const isVisible = answer.trim() === "" ? false : question.is_visible
    onQuestionChange(question.id, { answer, is_visible: isVisible })

    const willHaveVisibleAnswer = questions.some(candidate =>
      candidate.id === question.id
        ? isVisible && answer.trim() !== ""
        : candidate.is_visible && candidate.answer.trim() !== ""
    )

    if (!willHaveVisibleAnswer) onShowInterviewChange(false)
  }

  function updateQuestionVisibility(question: Question, isVisible: boolean) {
    onQuestionChange(question.id, { is_visible: isVisible })

    const willHaveVisibleAnswer = questions.some(candidate =>
      candidate.id === question.id
        ? isVisible && question.answer.trim() !== ""
        : candidate.is_visible && candidate.answer.trim() !== ""
    )

    if (isVisible) onShowInterviewChange(true)
    else if (!willHaveVisibleAnswer) onShowInterviewChange(false)
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-zinc-800 border border-zinc-700">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Conociendo al autor</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Comparte respuestas para que tus lectores te conozcan mejor.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Procura que sean respuestas breves para que la entrevista sea cómoda de leer, especialmente en celular.
          </p>
        </div>
      </div>

      <div
        className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          isPublished
            ? "border-green-500/30 bg-green-500/10"
            : hasVisibleAnswer
              ? "border-yellow-500/30 bg-yellow-500/10"
              : "border-zinc-700 bg-zinc-950"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isPublished
                ? "bg-green-500/15 text-green-300"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {isPublished ? (
              <Eye size={18} aria-hidden="true" />
            ) : (
              <EyeOff size={18} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-semibold text-zinc-100">
              {isPublished
                ? `Entrevista publicada · ${visibleAnswerCount} ${
                    visibleAnswerCount === 1 ? "respuesta visible" : "respuestas visibles"
                  }`
                : hasVisibleAnswer
                  ? `Entrevista oculta · ${visibleAnswerCount} ${
                      visibleAnswerCount === 1 ? "respuesta lista" : "respuestas listas"
                    }`
                  : "Entrevista sin publicar"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              {isPublished
                ? "Las respuestas incluidas aparecerán en tu página cuando guardes los cambios."
                : hasVisibleAnswer
                  ? "Tus respuestas seguirán seleccionadas y se conservarán al guardar, pero la sección completa no se mostrará."
                  : "Responde una pregunta e inclúyela para publicar automáticamente esta sección."}
            </p>
          </div>
        </div>

        {hasVisibleAnswer && (
          <button
            type="button"
            onClick={() => onShowInterviewChange(!isPublished)}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              isPublished
                ? "border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            {isPublished ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
            {isPublished ? "Ocultar entrevista completa" : "Publicar entrevista"}
          </button>
        )}
      </div>

      {questions.map(question => (
        <div key={question.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <p className="font-semibold leading-6">{question.question}</p>
          <div>
            <textarea
              value={question.answer}
              onChange={event => updateAnswer(question, event.target.value)}
              maxLength={700}
              rows={5}
              placeholder="Escribe tu respuesta..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white resize-y"
            />
            <p className="mt-1 text-right text-xs text-zinc-500">
              {question.answer.length}/700
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={question.is_visible}
              disabled={question.answer.trim() === ""}
              onChange={event => updateQuestionVisibility(question, event.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            Incluir esta respuesta en la entrevista
          </label>
        </div>
      ))}
    </section>
  )
}
