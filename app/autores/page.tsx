import { authors } from "@/data/authors"
import CardAuthor from "@/components/CardAuthor"

export default function Page() {
  return (
    <div className="p-10">
      <h1>Autores</h1>

      {authors.map(a => (
        <CardAuthor key={a.slug} author={a} />
      ))}
    </div>
  )
}