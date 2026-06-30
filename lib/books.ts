import { Book } from "@/types"
import { books as staticBooks } from "@/data/books"
import { supabase } from "@/lib/supabase"



export async function getBooks(): Promise<Book[]> {


  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      authors(
        slug
      )
    `)
    .eq("approved", true)



  if (error) {

    console.error(
      "Error cargando libros:",
      error
    )

    return staticBooks

  }



  const dynamicBooks: Book[] =
    (data || []).map((book: any) => ({


      slug:
        book.slug,


      title:
        book.title?.toUpperCase() || "",


      cover:
        book.cover || "",


      amazon: {

        es:
          book.asin_es || "",

        mx:
          book.asin_mx || "",

        us:
          book.asin_us || ""

      },


      amazonLink:
        book.amazon_link || "",


      authorSlug:
        book.authors?.slug
          ? [book.authors.slug]
          : [],



      isSaga:
        book.is_saga ?? false,



      categories:
        book.categories || [],



      summary:
        book.summary || "",



      review: {

        title:
          book.review_title || "",


        excerpt:
          book.review_excerpt || "",


        content:
          book.review_content || "",


        metrics:
          book.review_metrics || []

      },



      genre:
        book.genres || [],



      subgenres:
        book.subgenres || [],



      tags:
        book.tags || {

          ritmo: 0,
          complejidad: 0,
          cargaEmocional: 0,
          conflicto: 0,
          worldbuilding: 0,
          accesibilidad: 0,
          profundidad: 0

        }


    }))


  console.log("Libros encontrados:", data?.length)
  console.log(data)
  return [

    ...staticBooks,

    ...dynamicBooks

  ]

}