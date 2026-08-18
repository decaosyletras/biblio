"use client"

import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Tutorial, TutorialStep } from "@/lib/tutorials"

export default function AdminTutorialsPage() {
  const router = useRouter()
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState("")
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null)
  const [notices, setNotices] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadTutorials() {
      try {
        const response = await fetch("/api/admin/tutorials", {
          cache: "no-store",
        })
        const result = (await response.json().catch(() => null)) as
          | { tutorials?: Tutorial[]; error?: string }
          | null

        if (response.status === 401) {
          router.replace("/login")
          return
        }
        if (response.status === 403) {
          router.replace("/")
          return
        }
        if (!response.ok) {
          throw new Error(result?.error ?? "No se pudieron cargar los tutoriales")
        }

        setTutorials(result?.tutorials ?? [])
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los tutoriales"
        )
      } finally {
        setLoading(false)
      }
    }

    loadTutorials()
  }, [router])

  function updateTutorial(slug: string, update: Partial<Tutorial>) {
    setTutorials((current) =>
      current.map((tutorial) =>
        tutorial.slug === slug ? { ...tutorial, ...update } : tutorial
      )
    )
    setNotices((current) => ({ ...current, [slug]: "" }))
  }

  function updateStep(
    slug: string,
    stepId: string,
    update: Partial<TutorialStep>
  ) {
    setTutorials((current) =>
      current.map((tutorial) =>
        tutorial.slug === slug
          ? {
              ...tutorial,
              steps: tutorial.steps.map((step) =>
                step.id === stepId ? { ...step, ...update } : step
              ),
            }
          : tutorial
      )
    )
    setNotices((current) => ({ ...current, [slug]: "" }))
  }

  function addStep(slug: string) {
    const tutorial = tutorials.find((item) => item.slug === slug)
    if (!tutorial || tutorial.steps.length >= 20) return

    updateTutorial(slug, {
      steps: [
        ...tutorial.steps,
        {
          id: crypto.randomUUID(),
          title: "Nuevo paso",
          text: "Escribe aquí una indicación breve.",
          imagePath: null,
          imageUrl: null,
          actions: [],
        },
      ],
    })
  }

  function removeStep(slug: string, stepId: string) {
    const tutorial = tutorials.find((item) => item.slug === slug)
    if (!tutorial || tutorial.steps.length <= 1) return

    updateTutorial(slug, {
      steps: tutorial.steps.filter((step) => step.id !== stepId),
    })
  }

  function moveStep(slug: string, stepIndex: number, direction: -1 | 1) {
    const tutorial = tutorials.find((item) => item.slug === slug)
    if (!tutorial) return

    const targetIndex = stepIndex + direction
    if (targetIndex < 0 || targetIndex >= tutorial.steps.length) return

    const steps = [...tutorial.steps]
    ;[steps[stepIndex], steps[targetIndex]] = [
      steps[targetIndex],
      steps[stepIndex],
    ]
    updateTutorial(slug, { steps })
  }

  async function uploadImage(
    slug: string,
    stepId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploadingStepId(stepId)
    setNotices((current) => ({ ...current, [slug]: "" }))

    try {
      const formData = new FormData()
      formData.set("slug", slug)
      formData.set("image", file)

      const response = await fetch("/api/admin/tutorials/image", {
        method: "POST",
        body: formData,
      })
      const result = (await response.json().catch(() => null)) as
        | { imagePath?: string; imageUrl?: string; error?: string }
        | null

      if (!response.ok || !result?.imagePath || !result.imageUrl) {
        throw new Error(result?.error ?? "No se pudo subir la imagen")
      }

      updateStep(slug, stepId, {
        imagePath: result.imagePath,
        imageUrl: result.imageUrl,
      })
      setNotices((current) => ({
        ...current,
        [slug]: "Imagen lista. Guarda el tutorial para publicar el cambio.",
      }))
    } catch (error) {
      setNotices((current) => ({
        ...current,
        [slug]:
          error instanceof Error ? error.message : "No se pudo subir la imagen",
      }))
    } finally {
      setUploadingStepId(null)
    }
  }

  async function saveTutorial(tutorial: Tutorial) {
    setSavingSlug(tutorial.slug)
    setNotices((current) => ({ ...current, [tutorial.slug]: "" }))

    try {
      const response = await fetch("/api/admin/tutorials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorial }),
      })
      const result = (await response.json().catch(() => null)) as
        | { tutorial?: Tutorial; error?: string }
        | null

      if (!response.ok || !result?.tutorial) {
        throw new Error(result?.error ?? "No se pudo guardar el tutorial")
      }

      setTutorials((current) =>
        current.map((item) =>
          item.slug === tutorial.slug ? result.tutorial! : item
        )
      )
      setNotices((current) => ({
        ...current,
        [tutorial.slug]: "Tutorial guardado y publicado.",
      }))
    } catch (error) {
      setNotices((current) => ({
        ...current,
        [tutorial.slug]:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el tutorial",
      }))
    } finally {
      setSavingSlug(null)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        Cargando editor...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-red-300">
              Administración
            </p>
            <h1 className="mt-1 text-3xl font-bold">Editar tutoriales</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Modifica los textos, sube una captura por paso y acomoda el orden.
              Al guardar, el tutorial público se actualiza automáticamente.
            </p>
          </div>
          <Link
            href="/tutorial"
            target="_blank"
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium transition hover:bg-zinc-800"
          >
            Ver tutoriales
          </Link>
        </div>

        {pageError && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {pageError}. Verifica que la migración de tutoriales esté aplicada.
          </div>
        )}

        <div className="mt-10 space-y-10">
          {tutorials.map((tutorial) => (
            <section
              key={tutorial.slug}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                    Tutorial para {tutorial.slug}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{tutorial.title}</h2>
                </div>
                <Link
                  href={`/tutorial/${tutorial.slug}`}
                  target="_blank"
                  className="text-sm font-semibold text-yellow-300 hover:text-yellow-200"
                >
                  Abrir vista pública →
                </Link>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Título del tutorial
                  <input
                    value={tutorial.title}
                    maxLength={100}
                    onChange={(event) =>
                      updateTutorial(tutorial.slug, { title: event.target.value })
                    }
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Descripción breve
                  <textarea
                    value={tutorial.description}
                    maxLength={300}
                    rows={2}
                    onChange={(event) =>
                      updateTutorial(tutorial.slug, {
                        description: event.target.value,
                      })
                    }
                    className="resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
                  />
                </label>
              </div>

              <div className="mt-8 space-y-5">
                {tutorial.steps.map((step, stepIndex) => (
                  <article
                    key={step.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-yellow-300">
                        Paso {stepIndex + 1}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveStep(tutorial.slug, stepIndex, -1)}
                          disabled={stepIndex === 0}
                          aria-label={`Subir el paso ${stepIndex + 1}`}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(tutorial.slug, stepIndex, 1)}
                          disabled={stepIndex === tutorial.steps.length - 1}
                          aria-label={`Bajar el paso ${stepIndex + 1}`}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(tutorial.slug, step.id)}
                          disabled={tutorial.steps.length <= 1}
                          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-300 disabled:opacity-30"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4">
                      <label className="grid gap-2 text-sm font-medium">
                        Título
                        <input
                          value={step.title}
                          maxLength={100}
                          onChange={(event) =>
                            updateStep(tutorial.slug, step.id, {
                              title: event.target.value,
                            })
                          }
                          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Texto
                        <textarea
                          value={step.text}
                          maxLength={500}
                          rows={3}
                          onChange={(event) =>
                            updateStep(tutorial.slug, step.id, {
                              text: event.target.value,
                            })
                          }
                          className="resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                        />
                      </label>

                      <div>
                        <p className="text-sm font-medium">
                          Botones <span className="font-normal text-zinc-500">(opcionales)</span>
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Puedes agregar hasta dos botones. Las rutas deben ser internas,
                          por ejemplo <span className="font-mono">/me/library</span>.
                        </p>
                        <div className="mt-3 grid gap-3">
                          {[0, 1].map((actionIndex) => {
                            const action = step.actions[actionIndex] ?? {
                              label: "",
                              href: "",
                            }

                            const updateAction = (
                              update: Partial<typeof action>
                            ) => {
                              const actions = Array.from(
                                {
                                  length: Math.max(
                                    step.actions.length,
                                    actionIndex + 1
                                  ),
                                },
                                (_, index) =>
                                  step.actions[index] ?? { label: "", href: "" }
                              )
                              actions[actionIndex] = { ...action, ...update }

                              while (
                                actions.length > 0 &&
                                !actions.at(-1)?.label &&
                                !actions.at(-1)?.href
                              ) {
                                actions.pop()
                              }

                              updateStep(tutorial.slug, step.id, {
                                actions,
                              })
                            }

                            return (
                              <div
                                key={actionIndex}
                                className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:grid-cols-2"
                              >
                                <label className="grid gap-1.5 text-xs text-zinc-400">
                                  Texto del botón {actionIndex + 1}
                                  <input
                                    value={action.label}
                                    maxLength={80}
                                    placeholder={
                                      actionIndex === 0
                                        ? "Ir a Mi espacio"
                                        : "Botón secundario"
                                    }
                                    onChange={(event) =>
                                      updateAction({ label: event.target.value })
                                    }
                                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-500"
                                  />
                                </label>
                                <label className="grid gap-1.5 text-xs text-zinc-400">
                                  Ruta del botón {actionIndex + 1}
                                  <input
                                    value={action.href}
                                    maxLength={200}
                                    placeholder="/me"
                                    onChange={(event) =>
                                      updateAction({ href: event.target.value })
                                    }
                                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none focus:border-yellow-500"
                                  />
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Imagen</p>
                        {step.imageUrl ? (
                          <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                            {/* La imagen proviene exclusivamente del bucket administrado de tutoriales. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={step.imageUrl}
                              alt={`Vista previa de ${step.title}`}
                              className="max-h-[28rem] w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="mt-2 rounded-2xl border border-dashed border-zinc-700 px-5 py-10 text-center text-sm text-zinc-500">
                            Este paso todavía no tiene imagen.
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="cursor-pointer rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-700">
                            {uploadingStepId === step.id
                              ? "Procesando..."
                              : step.imageUrl
                                ? "Cambiar imagen"
                                : "Subir imagen"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={uploadingStepId !== null}
                              onChange={(event) =>
                                uploadImage(tutorial.slug, step.id, event)
                              }
                              className="sr-only"
                            />
                          </label>
                          {step.imageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStep(tutorial.slug, step.id, {
                                  imagePath: null,
                                  imageUrl: null,
                                })
                              }
                              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300"
                            >
                              Quitar imagen
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                          JPG, PNG o WebP, hasta 5 MB. Se optimizará automáticamente.
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => addStep(tutorial.slug)}
                  disabled={tutorial.steps.length >= 20}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-800 disabled:opacity-40"
                >
                  + Agregar paso
                </button>
                <div className="flex flex-col gap-3 sm:items-end">
                  {notices[tutorial.slug] && (
                    <p className="text-sm text-zinc-300" role="status">
                      {notices[tutorial.slug]}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => saveTutorial(tutorial)}
                    disabled={savingSlug !== null || uploadingStepId !== null}
                    className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                  >
                    {savingSlug === tutorial.slug
                      ? "Guardando..."
                      : "Guardar y publicar"}
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
