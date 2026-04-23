import { Book } from "@/types"

export const books: Book[] = [
  {
    slug: "tras-el-caos-de-la-existencia-descubrimiento",
    title: "TRAS EL CAOS DE LA EXISTENCIA: DESCUBRIMIENTO",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "marcos-m-jimenez-gonzalez",
    categories: [3, 5, 9],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "¿Para quién es?",
      content:
        "",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["operaespacial", "xenoficcion", "evolucionespeculativa", "espiritual"],

    tags: {
      ritmo: 1,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },{
    slug: "tras-el-caos-de-la-existencia-divisiones-y-conflictos",
    title: "TRAS EL CAOS DE LA EXISTENCIA: DIVISIONES Y CONFLICTOS",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "marcos-m-jimenez-gonzalez",
    categories: [3, 9],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["operaespacial", "xenoficcion", "evolucionespeculativa", "viajestiempo"],

    tags: {
      ritmo: 2,
      complejidad: 2,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "tras-el-caos-de-la-existencia-designios-ancestrales",
    title: "TRAS EL CAOS DE LA EXISTENCIA: DESIGNIOS ANCESTRALES",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "marcos-m-jimenez-gonzalez",
    categories: [3, 9],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["operaespacial", "xenoficcion", "evolucionespeculativa"],

    tags: {
      ritmo: 2,
      complejidad: 3,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 2,
      accesibilidad: 2,
      profundidadTematica: 2,
    }
  },{
    slug: "jodidos-mas-no-vencidos",
    title: "JODIDOS, MAS NO VENCIDOS",
    cover: "/covers/jodidos.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "marcos-m-jimenez-gonzalez",
    categories: [1, 9],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos","ia", "espiritualidad"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia"],

    tags: {
      ritmo: 2,
      complejidad: 2,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 1,
      accesibilidad: 2,
      profundidadTematica: 3,
    }
  },
  {
    slug: "libertadores",
    title: "LIBERTADORES",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "juan-carlos-lopez-bayon",
    categories: [2, 5],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["operaespacial", "exploracionespacial", "militar"],

    tags: {
      ritmo: 2,
      complejidad: 1,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "holocausto-biologico",
    title: "HOLOCAUSTO BIOLÓGICO",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "javier-maeso",
    categories: [2],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["operaespacial"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 1,
      conflicto: 2,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "2092-la-era-de-la-superinteligencia-artificial",
    title: "2092 LA ERA DE LA SUPERINTELIGENCIA ARTIFICIAL",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "camilo-rojas-rodriguez",
    categories: [3, 6],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content: "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia", "ai", "technothriller"],

    tags: {
      ritmo: 3,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "rustic-metaverse-la-era-de-la.ascencion",
    title: "RUSTIC METAVERSE: LA ERA DE LA ASCENCIÓN",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "j-e-fourt",
    categories: [3, 6],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 2...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia, technothriller, cyberpunk"],

    tags: {
      ritmo: 3,
      complejidad: 2,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "planeta-misterio",
    title: "PLANETA MISTERIO",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "oscar-gonzalez-cruz",
    categories: [1],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 3...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["cuentos, distopia, viajestiempo, cyberpunk"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  /*{
    slug: "el-asesino-de-google-maps",
    title: "EL ASESINO DE GOOGLE MAPS",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Juan Herranz",
    categories: [3, 6],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 4...",
        metrics: [
          { id: 1, value: 9 },
          { id: 2, value: 7 },
          { id: 3, value: 8 },
          { id: 4, value: 6 },
          { id: 5, value: 7 },
        ]
    },
    genres: {
      cienciaFiccion: 5,
      fantasia: 2,
      misterio: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },*/
  {
    slug: "el-bucle",
    title: "EL BUCLE",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "jose-m-aldasoro",
    categories: [3, 6],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 4...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia, technothriller, cyberpunk"],

    tags: {
      ritmo: 2,
      complejidad: 2,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 2,
      profundidadTematica: 3,
    }
  },
  {
    slug: "el-juego-de-la-realidad",
    title: "EL JUEGO DE LA REALIDAD",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "a-a-espino",
    categories: [6],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 4...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["technothriller, militar, realidadvirtual"],

    tags: {
      ritmo: 2,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "los-trece-rostros-de-la-muerte",
    title: "LOS TRECE ROSTROS DE LA MUERTE",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "noe-martin-salido",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 5...",
      metrics: ["cuentos"],
    },
    genre: ["fantasia", "+"],
    subgenres: ["urbana, historica, relatos"],

    tags: {
      ritmo: 2,
      complejidad: 1,
      cargaEmocional: 2,
      conflicto: 1,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "el-silencio-del-agua",
    title: "EL SILENCIO DEL AGUA",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "julian-drake",
    categories: [1],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 6...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia, postapocaliptica"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "solo-quedaron-las-cascaras",
    title: "SOLO QUEDARON LAS CÁSCARAS",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "nicole-sanchez-castillo",
    categories: [1],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["terror"],
    subgenres: ["psicologico","existencial"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "remnax",
    title: "REMNAX",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "alejandro-p-c",
    categories: [2],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["aventura"],
    subgenres: ["supervivencia","militar"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 1,
      conflicto: 1,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "dones-mortales",
    title: "DONES MORTALES",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "keira-moreau",
    categories: [2],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["romance", "fantasia"],
    subgenres: ["amorprohibido", "erotico", "oscura"],

    tags: {
      ritmo: 3,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "draguenorux",
    title: "DRAGUENORUX: EL DRAGÓN FLUORESCENTE",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "gabriel-vilches-barroso",
    categories: [4, 5],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["militar", "biopunk", "satira"],

    tags: {
      ritmo: 3,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "musi-regresa",
    title: "MUSI REGRESA POR NAVIDAD",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "juan-carlos-lopez-bayon",
    categories: [1, 2],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos"],
    },
    genre: ["ficcion", "+"],
    subgenres: ["emotiva"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 1,
      worldbuilding: 1,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "el-himno-dee-desierto-1",
    title: "EL HIMNO DEL DESIERTO I: EL DESIERTO SIN FIN",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "eduardo-d-allen",
    categories: [3, 5],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos","aventura","supervivencia"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia", "postapocaliptica"],

    tags: {
      ritmo: 1,
      complejidad: 2,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "ozyux",
    title: "OZYUX: EL VALOR DE UNA VIDA INTERGALÁCTICA",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "gabriel-vilches-barroso",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos", "militar", "adulta"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["operaespacial","xenoficcion"],

    tags: {
      ritmo: 3,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "el-himno-dee-desierto-2",
    title: "EL HIMNO DEL DESIERTO II: LA LEYENDA DEL VIENTO",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "eduardo-d-allen",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos", "rebelion"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia", "postapocaliptica"],

    tags: {
      ritmo: 1,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "compilacion-de-relatos",
    title: "COMPILACIÓN DE RELATOS: CINCO RELATOS DE EMOCIÓN, OSCURIDAD Y REFLEXIÓN",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "sergio-velez-rodríguez",
    categories: [1],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos", "reflexion"],
    },
    genre: ["aventura"],
    subgenres: ["cuentos"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 2,
      conflicto: 1,
      worldbuilding: 1,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "cronicas-walker-destino",
    title: "CRÓNICAS WALKER: DESTINO",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "luis-rivera",
    categories: [3, 5],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos", "juvenil"],
    },
    genre: ["fantasia"],
    subgenres: ["urbana"],

    tags: {
      ritmo: 3,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "cronicas-walker-discordia",
    title: "CRÓNICAS WALKER: DISCORDIA",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "luis-rivera",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cuentos","juvenil","accion","conspiracion"],
    },
    genre: ["fantasia"],
    subgenres: ["urbana"],

    tags: {
      ritmo: 2,
      complejidad: 3,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 2,
      profundidadTematica: 2,
    }
  },
  {
    slug: "ovni-redencion",
    title: "OVNI: REDENCIÓN",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "j-c-plaza",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["supervivencia"],
    },
    genre: ["thriller", "cienciaFiccion"],
    subgenres: [""],

    tags: {
      ritmo: 2,
      complejidad: 1,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "tablero-mortal",
    title: "TABLERO MORTAL",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "javier-marin",
    categories: [5],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["misterioaresolver"],
    },
    genre: ["thriller"],
    subgenres: ["policial", "psicologico", "asesinoenserie"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "proyecto-sombras",
    title: "PROYECTO SOMBRAS",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "maximilian-cross",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["conspiracion"],
    },
    genre: ["misterio"],
    subgenres: ["especulativo"],

    tags: {
      ritmo: 1,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 1,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "mutagenesis-convergente",
    title: "MUTAGÉNESIS CONVERGENTE",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "juan-antonio-jimenez",
    categories: [3, 6],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["cienciadura"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["solarpunk"],

    tags: {
      ritmo: 1,
      complejidad: 3,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 2,
      accesibilidad: 2,
      profundidadTematica: 3,
    }
  },
  {
    slug: "cuando-te-lleve",
    title: "CUANDO TE LLEVE",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "adner-perez-garcia",
    categories: [1, 2],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["relatos", "reflexion"],
    },
    genre: ["ficcion"],
    subgenres: [],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 1,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "cronicas-walker-oblivion",
    title: "CRÓNICAS WALKER: OBLIVION",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "luis-rivera",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["conspiracion", "accion"],
    },
    genre: ["fantasia", "misterio"],
    subgenres: ["oscura"],

    tags: {
      ritmo: 2,
      complejidad: 3,
      cargaEmocional: 3,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 2,
      profundidadTematica: 2,
    }
  },
  {
    slug: "tormenta-de-azar",
    title: "TORMENTA DE AZAR",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "daniel-galvez-estevez",
    categories: [2],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["misticismo"],
    },
    genre: ["Ficción","misterio","romance"],
    subgenres: ["psicologico"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 1,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "el-mundo-de-eterna-la-elegida",
    title: "EL MUNDO DE ETERNA: LA ELEGIDA",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "belu-elein",
    categories: [5],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["aventura"],
    },
    genre: ["fantasia", "romance"],
    subgenres: ["epica", "amorprohibido"],

    tags: {
      ritmo: 2,
      complejidad: 1,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 3,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "el-himno-del-desierto-la-cima-del-mundo",
    title: "EL HIMNO DEL DESIERTO III: LA CIMA DEL MUNDO",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "eduardo-d-allen",
    categories: [3],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["supervivencia"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["distopia", "postapocaliptica"],

    tags: {
      ritmo: 2,
      complejidad: 2,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 2,
      profundidadTematica: 2,
    }
  },
  {
    slug: "el-ultimo-viaje",
    title: "EL ÚLTIMO VIAJE",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "arnulfo-diaz",
    categories: [1],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["relatocorto"],
    },
    genre: ["ficcion"],
    subgenres: ["emotiva"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 1,
      accesibilidad: 1,
      profundidadTematica: 1,
    }
  },
  {
    slug: "han-robado-el-infinito",
    title: "HAN ROBADO EL INFINITO",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "david-sanz",
    categories: [3, 6],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["humor", "reflexion"],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["exploracionespacial"],

    tags: {
      ritmo: 1,
      complejidad: 3,
      cargaEmocional: 2,
      conflicto: 2,
      worldbuilding: 3,
      accesibilidad: 2,
      profundidadTematica: 3,
    }
  },
  {
    slug: "fisura-interdimensional",
    title: "FISURA INTERDIMENSIONAL",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "marcos-vega",
    categories: [3, 6, 7],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["historiasparalelas", "espiritualidad"],
    },
    genre: ["fantasia", "terror"],
    subgenres: ["oscura", "cosmico"],

    tags: {
      ritmo: 2,
      complejidad: 2,
      cargaEmocional: 2,
      conflicto: 3,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 3,
    }
  },
  {
    slug: "el-sinsentido-de-las-cartas",
    title: "EL SINSENTIDO DE LAS CARTAS: DEL AMOR AL ODIO HAY UN UNIVERSO DE POR MEDIO",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "beatriz-lillo",
    categories: [4],
    summary: "Resumen del libro...",
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: ["misticismo"],
    },
    genre: ["romance"],
    subgenres: ["enemiestolovers"],

    tags: {
      ritmo: 3,
      complejidad: 1,
      cargaEmocional: 3,
      conflicto: 2,
      worldbuilding: 2,
      accesibilidad: 1,
      profundidadTematica: 2,
    }
  },
  {
    slug: "prueba",
    title: "PRUEBA DE LIBRO NO LEÍDO",
    cover: "/covers/jodidos.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "beatriz-lillo",
    categories: [4],
    summary: "Resumen del libro...",
    review: {
      title: "",
      excerpt: "",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
      metrics: [],
    },
    genre: ["cienciaFiccion"],
    subgenres: ["exploracionespacial"],

    tags: {
      ritmo: 0,
      complejidad: 0,
      cargaEmocional: 0,
      conflicto: 0,
      worldbuilding: 0,
      accesibilidad: 0,
      profundidadTematica: 0,
    }
  }
]