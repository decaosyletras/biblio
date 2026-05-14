export function getAmazonCover(asin?: string) {

  if (!asin) return "/placeholder-book.jpg"

  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.L.jpg`
}