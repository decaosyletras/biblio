"use client"

import { usePathname } from "next/navigation"
import BackButton from "./BackButton"

export default function BackWrapper() {
  const pathname = usePathname()

  if (pathname === "/") return null

  return <BackButton />
}