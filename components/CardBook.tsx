import { Book } from "@/types"

export default function CardBook({ book }: { book: Book }) {
  return (
    <a href={book.amazonLink} target="_blank">
      <div className="hover:scale-105 transition">
        <img src={book.cover} className="w-full rounded-xl" />
      </div>
    </a>
  )
}