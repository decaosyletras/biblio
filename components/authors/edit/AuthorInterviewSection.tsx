"use client"

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
  const hasVisibleAnswer = questions.some(
    question => question.is_visible && question.answer.trim() !== ""
  )

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-zinc-800 border border-zinc-700">
          💬
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Conociendo al autor</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Comparte respuestas para que tus lectores te conozcan mejor.
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
        <input
          type="checkbox"
          checked={showInterview}
          disabled={!hasVisibleAnswer}
          onChange={event => onShowInterviewChange(event.target.checked)}
          className="mt-1 h-4 w-4 accent-blue-500"
        />
        <span>
          <span className="block font-semibold">Mostrar la sección pública</span>
          <span className="block text-sm text-zinc-400 mt-1">
            {hasVisibleAnswer
              ? "Se mostrará cuando guardes los cambios."
              : "Responde y activa al menos una pregunta para poder mostrarla."}
          </span>
        </span>
      </label>

      {questions.map(question => (
        <div key={question.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <p className="font-semibold leading-6">{question.question}</p>
          <textarea
            value={question.answer}
            onChange={event => onQuestionChange(question.id, { answer: event.target.value })}
            maxLength={5000}
            rows={5}
            placeholder="Escribe tu respuesta..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white resize-y"
          />
          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={question.is_visible}
              disabled={question.answer.trim() === ""}
              onChange={event => onQuestionChange(question.id, { is_visible: event.target.checked })}
              className="h-4 w-4 accent-blue-500"
            />
            Mostrar esta pregunta en mi página pública
          </label>
        </div>
      ))}
    </section>
  )
}
