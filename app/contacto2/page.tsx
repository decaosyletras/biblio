"use client"

import { useState } from "react"

import GenreSelector from "@/components/GenreSelector"
import SubgenreSelector from "@/components/SubgenreSelector"
import TagSelector from "@/components/TagSelector"

import { genresCatalog } from "@/data/genres"
import { metricsCatalog } from "@/data/metrics"


export default function Page() {


  const [titulo,setTitulo] = useState("")
  const [autor,setAutor] = useState("")

  const [esSaga,setEsSaga] = useState(false)

  const [link,setLink] = useState("")
  const [resumen,setResumen] = useState("")
  const [asin,setAsin] = useState("")


  const [selectedGenres,setSelectedGenres] =
  useState<string[]>([])

  const [selectedSubgenres,setSelectedSubgenres] =
  useState<string[]>([])

  const [selectedTags,setSelectedTags] =
  useState<string[]>([])


  const [aceptaTerminos,setAceptaTerminos] =
  useState(false)


  const [loading,setLoading] =
  useState(false)

  const [error,setError] =
  useState("")

  const [sent,setSent] =
  useState(false)



  const isValidASIN = (value:string)=>
    /^[a-zA-Z0-9]{10}$/.test(value)



  const validateForm =()=>{


    if(!titulo)
      return "El título es obligatorio."


    if(!autor)
      return "El autor es obligatorio."


    if(!asin)
      return "El ASIN es obligatorio."


    if(!isValidASIN(asin))
      return "El ASIN debe tener 10 caracteres alfanuméricos."


    if(!link)
      return "El link de Amazon es obligatorio."


    if(!resumen)
      return "El resumen es obligatorio."


    if(selectedGenres.length===0)
      return "Selecciona al menos un género."


    if(selectedTags.length===0)
      return "Selecciona al menos una etiqueta."


    if(!aceptaTerminos)
      return "Debes aceptar la política de privacidad."


    return null

  }





  async function handleSubmit(){


    setError("")
    setSent(false)


    const validationError =
      validateForm()


    if(validationError){

      setError(validationError)
      return

    }


    setLoading(true)



    try{


      const res =
      await fetch("/api/libro-nuevo",{


        method:"POST",


        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          titulo,

          autor,

          esSaga,

          link,

          resumen,

          asin,


          generos:selectedGenres,

          subgeneros:selectedSubgenres,

          tags:selectedTags,

          aceptaTerminos

        })


      })




      const data =
      await res.json()



      if(!res.ok){

        setError(
          data.error ||
          "Error al guardar"
        )

        setLoading(false)
        return

      }




      setSent(true)



      setTitulo("")
      setAutor("")
      setEsSaga(false)
      setLink("")
      setResumen("")
      setAsin("")

      setSelectedGenres([])
      setSelectedSubgenres([])
      setSelectedTags([])

      setAceptaTerminos(false)



    }
    catch(error){

      setError(
        "Error de conexión 😢"
      )

    }



    setLoading(false)

  }







return (


<section
className="
min-h-screen
bg-black
px-4
py-8
flex
items-start
justify-center
"
>


<div
className="
w-full
max-w-xl
bg-zinc-900
rounded-2xl
p-5
sm:p-8
shadow-xl
"
>



<h1
className="
text-2xl
sm:text-3xl
font-bold
mb-2
"
>
Registrar libro nuevo
</h1>



<p
className="
text-zinc-400
text-sm
sm:text-base
mb-6
"
>
Recomienda tu libro o uno que te haya gustado. Llena los datos tal como quieres que se muestren en la página.
</p>





<input

type="text"

placeholder="Título del libro (máx. 50 caracteres)"

maxLength={50}

value={titulo}

onChange={
e=>setTitulo(
e.target.value.toUpperCase()
)
}

className="
w-full
p-4
mb-4
rounded-xl
bg-zinc-800
focus:outline-none
focus:ring-2
focus:ring-yellow-500
"

/>





<input

type="text"

placeholder="Nombre del autor (como aparece en Amazon)"

value={autor}

onChange={
e=>setAutor(e.target.value)
}

className="
w-full
p-4
mb-4
rounded-xl
bg-zinc-800
focus:outline-none
focus:ring-2
focus:ring-yellow-500
"

/>






<div className="mb-4">


<p className="mb-2 text-sm text-zinc-300">

¿Es parte de una saga?

</p>


<label
className="flex items-center text-sm cursor-pointer"
>


<input

type="checkbox"

checked={esSaga}

onChange={
e=>setEsSaga(
e.target.checked
)
}

className="mr-2"

/>


Sí


</label>


</div>







<input

type="text"

placeholder="Link de Amazon"

value={link}

onChange={
e=>setLink(e.target.value)
}

className="
w-full
p-4
mb-4
rounded-xl
bg-zinc-800
focus:outline-none
focus:ring-2
focus:ring-yellow-500
"

/>






<input

type="text"

placeholder="ASIN del ebook (versión digital)"

maxLength={10}

value={asin}

onChange={
e=>setAsin(e.target.value)
}

className="
w-full
p-4
mb-4
rounded-xl
bg-zinc-800
focus:outline-none
focus:ring-2
focus:ring-yellow-500
"

/>







<textarea

placeholder="¿De qué trata el libro?"

maxLength={999}

value={resumen}

onChange={
e=>setResumen(e.target.value)
}

className="
w-full
p-4
mb-2
rounded-xl
bg-zinc-800
h-36
resize-none
focus:outline-none
focus:ring-2
focus:ring-yellow-500
"

/>




<p
className="
text-xs
text-zinc-500
mb-6
text-right
"
>
{resumen.length}/999
</p>







<div className="mb-6 space-y-4">


<GenreSelector

genresCatalog={genresCatalog}

selectedGenres={selectedGenres}

setSelectedGenres={setSelectedGenres}

/>



<SubgenreSelector

genresCatalog={genresCatalog}

selectedGenres={selectedGenres}

selectedSubgenres={selectedSubgenres}

setSelectedSubgenres={setSelectedSubgenres}

/>



<TagSelector

tagsCatalog={metricsCatalog}

selectedTags={selectedTags}

setSelectedTags={setSelectedTags}

/>


</div>







{/* PRIVACIDAD */}

<div className="mb-6">


<label
className="
flex
items-start
gap-3
text-sm
text-zinc-300
"
>


<input

type="checkbox"

checked={aceptaTerminos}

onChange={
e=>setAceptaTerminos(
e.target.checked
)
}

className="mt-1"

/>


<span>

He leído y acepto la{" "}

<a

href="/privacidad"

target="_blank"

className="
text-yellow-400
hover:underline
"

>

Política de Privacidad

</a>


</span>


</label>


</div>








{
error &&

<div
className="
bg-red-500/10
border
border-red-500/30
text-red-400
p-3
rounded-lg
mb-4
text-sm
"
>

{error}

</div>

}







{
sent &&

<div
className="
bg-green-500/10
border
border-green-500/30
text-green-400
p-3
rounded-lg
mb-4
text-sm
"
>

¡Libro guardado correctamente! Si crees que hubo un error puedes contactarnos a través de nuestras redes sociales: @decaosyletras

</div>

}








<button

onClick={handleSubmit}

disabled={loading}

className="
w-full
sm:w-auto
px-8
py-4
rounded-xl
font-semibold
bg-yellow-500
text-black
hover:bg-yellow-400
transition
disabled:opacity-50
"

>

{
loading
?
"Guardando..."
:
"Enviar libro"
}


</button>





</div>


</section>


)

}