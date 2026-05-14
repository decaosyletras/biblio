"use client"

import { generateAmazonLink }
from "@/lib/amazon"

export default function AmazonButton({
  amazon
}: {
  amazon: Record<string, string>
}) {

  const handleClick = () => {


    //PARA PROBAR COMENTAMOS DESDE ACÁ
    let country = "US"
    const lang =
      navigator.language.toLowerCase()

    if (
      lang.includes("es-es")
    ) {
      country = "ES"
    } // Y HASTA ACÁ, Y LUEGO

    //DESCOMENTAMOS ESTA PARTECITA
    /*const TEST_COUNTRY = "US"
    let country = TEST_COUNTRY*/


    

    const url =
      generateAmazonLink(
        amazon,
        country
      )

    window.open(url, "_blank")
  }

  return (
    <button 
      onClick={handleClick}
      className="
        mt-4
        bg-yellow-500
        hover:bg-yellow-400
        text-black
        px-3 py-1.5
        rounded-full
        font-medium
        text-sm
        transition
        whitespace-nowrap
      "
    >
      Ver en Amazon
    </button>
  )
}