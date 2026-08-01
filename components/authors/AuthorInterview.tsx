"use client"

import { useState } from "react"

type Question = {
  id: string
  question: string
  answer: string
}

type Theme = {
  surface: string
  primary: string
  text: string
  border: string
}

type Props = {
  questions: Question[]
  theme: Theme
}

const INITIAL_QUESTION_COUNT = 2

export default function AuthorInterview({ questions, theme }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMoreQuestions = questions.length > INITIAL_QUESTION_COUNT
  const visibleQuestions = isExpanded
    ? questions
    : questions.slice(0, INITIAL_QUESTION_COUNT)

  return (
    <section
      className="rounded-3xl p-6 md:p-8"
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`
      }}
    >
      <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
        Conociendo al autor
      </h2>

      <div className="mt-6 space-y-6">
        {visibleQuestions.map(question => (
          <article key={question.id}>
            <h3
              className="font-semibold leading-7"
              style={{ color: theme.primary }}
            >
              {question.question}
            </h3>
            <p
              className="mt-3 whitespace-pre-line leading-7"
              style={{ color: theme.text }}
            >
              {question.answer}
            </p>
          </article>
        ))}
      </div>

      {hasMoreQuestions && (
        <button
          type="button"
          onClick={() => setIsExpanded(current => !current)}
          aria-expanded={isExpanded}
          className="mt-7 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition hover:opacity-80"
          style={{
            borderColor: theme.border,
            color: theme.primary
          }}
        >
          {isExpanded
            ? "Mostrar menos"
            : `Ver entrevista completa (${questions.length})`}
        </button>
      )}
    </section>
  )
}
