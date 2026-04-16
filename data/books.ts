import { Book } from "@/types"

export const books: Book[] = [
  {
    slug: "libertadores",
    title: "LIBERTADORES",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Juan Carlos López Bayón",
    categories: [1, 4],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
        metrics: [
          { id: 1, value: 9 },
          { id: 2, value: 7 },
          { id: 3, value: 8 },
          { id: 4, value: 6 },
          { id: 5, value: 7 },
          { id: 22, value: 8 },
        ]
    },
    genres: {
      cienciaFiccion: 5,
      fantasia: 2,
      misterio: 2,
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "holocausto-biologico",
    title: "HOLOCAUSTO BIOLÓGICO",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Javier Maeso",
    categories: [1, 4],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "2092-la-era-de-la-superinteligencia-artificial",
    title: "2092 LA ERA DE LA SUPERINTELIGENCIA ARTIFICIAL",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Camilo Rojas Rodríguez",
    categories: [2, 3, 4],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content: "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "rustic-metaverse-la-era-de-la.ascencion",
    title: "RUSTIC METAVERSE: LA ERA DE LA ASCENCIÓN",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "J. E. FOURT",
    categories: [2],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 2...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "planeta-misterio",
    title: "PLANETA MISTERIO",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Oscar González Cruz",
    categories: [1, 3],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 3...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "el-asesino-de-google-maps",
    title: "EL ASESINO DE GOOGLE MAPS",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Juan Herranz",
    categories: [1, 2],
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "el-bucle",
    title: "EL BUCLE",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "José M. Aldasoro",
    categories: [1, 2],
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "el-juego-de-la-realidad",
    title: "EL JUEGO DE LA REALIDAD",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "A. A. Espiño",
    categories: [1, 2],
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "los-trece-rostros-de-la-muerte",
    title: "LOS TRECE ROSTROS DE LA MUERTE",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Noé Martín Salido",
    categories: [1, 3],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 5...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }

  },
  {
    slug: "el-silencio-del-agua",
    title: "EL SILENCIO DEL AGUA",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Julián Drake",
    categories: [1],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "RESEÑA 6...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }

  },
  {
    slug: "solo-quedaron-las-cascaras",
    title: "SOLO QUEDARON LAS CÁSCARAS",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Nicole Sánchez Castillo",
    categories: [2, 3],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "remnax",
    title: "REMNAX",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Alejandro P. C.",
    categories: [1, 2],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "dones-mortales",
    title: "DONES MORTALES",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Keira Moreau",
    categories: [2, 3],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  }
  ,{
    slug: "draguenorux",
    title: "DRAGUENORUX: EL DRAGÓN FLUORESCENTE",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Gabriel Vilches Barroso",
    categories: [1, 2],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "musi-regresa",
    title: "MUSI REGRESA POR NAVIDAD",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Juan Carlos López Bayón",
    categories: [1],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "el-himno-dee-desierto-1",
    title: "EL HIMNO DEL DESIERTO I: EL DESIERTO SIN FIN",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Eduardo D. Allen",
    categories: [1, 2],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "ozyux",
    title: "OZYUX: EL VALOR DE UNA VIDA INTERGALÁCTICA",
    cover: "/covers/book1.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Gabriel Vilches Barroso",
    categories: [1, 2],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "el-himno-dee-desierto-2",
    title: "EL HIMNO DEL DESIERTO I: LA LEYENDA DEL VIENTO",
    cover: "/covers/book2.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Eduardo D. Allen",
    categories: [3],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  },
  {
    slug: "compilacion-de-relatos",
    title: "COMPILACIÓN DE RELATOS: CINCO RELATOS DE EMOCIÓN, OSCURIDAD Y REFLEXIÓN",
    cover: "/covers/book3.jpg",
    amazonLink: "https://amazon.com",
    authorSlug: "Sergio Vélez Rodríguez",
    categories: [1, 2],
    review: {
      title: "Una historia que se queda contigo",
      excerpt: "Intenso, emocional y difícil de soltar.",
      content:
        "Este libro logra meterte en la mente de los personajes y no soltarte...",
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
      thriller: 2,
      terror: 2,
      suspenso: 2,
      aventura: 2,
      romance: 2,
    }
  }
]