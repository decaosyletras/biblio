import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)



function normalizeName(name:string){

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]/g,"")

}



function createSlug(name:string){

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-|-$/g,"")

}



export async function POST(req:Request){

try{


const body = await req.json()


const {
titulo,
autor,
esSaga,
link,
resumen,
asin,
generos,
subgeneros,
tags

}=body



if(!titulo || !autor){

return NextResponse.json(
{
error:"Faltan título o autor"
},
{
status:400
}
)

}




// ==========================
// 1. BUSCAR AUTOR
// ==========================


const normalized =
normalizeName(autor)


let authorId:string | null = null



const {data:foundAuthor}=await supabase

.from("authors")

.select("id")

.eq(
"normalized_name",
normalized
)

.maybeSingle()



if(foundAuthor){

authorId = foundAuthor.id

}




// ==========================
// 2. CREAR AUTOR SI NO EXISTE
// ==========================


if(!authorId){


const {data:newAuthor,error}=await supabase

.from("authors")

.insert({
name:autor,
slug:createSlug(autor),
normalized_name:normalized
})
.select("id")
.single()


if(error){
return NextResponse.json(
{
error:error.message
},
{
status:400
}
)
}
authorId=newAuthor.id
}


// ==========================
// 3. CREAR LIBRO
// ==========================


const {error:bookError}=await supabase

.from("books")

.insert({

title:titulo,

slug:createSlug(titulo),

asin_es:asin,
asin_mx:asin,
asin_us:asin,

amazon_link:link,

author_id:authorId,

is_saga:esSaga,

summary:resumen,

genres:generos,

subgenres:subgeneros,

review_metrics:tags,

approved:true

})



if(bookError){

return NextResponse.json(
{
error:bookError.message
},
{
status:400
}
)

}



return NextResponse.json({
success:true
})



}
catch(error){

return NextResponse.json(
{
error:"Error interno"
},
{
status:500
}
)

}



}