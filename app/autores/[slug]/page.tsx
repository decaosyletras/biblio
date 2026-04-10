import { authors } from "@/data/authors"

export default function Page({ params }: any) {
  const author = authors.find(a => a.slug === params.slug)

  if (!author) return <div>No encontrado</div>

  return <div>{author.name}</div>
}