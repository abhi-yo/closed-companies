import { cn } from "@/lib/utils"
import type React from "react" // Import React to declare JSX
import type { JSX } from "react" // Import JSX type from React

interface HeadingProps {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  useDoto?: boolean
}

export function Heading({ children, level = 1, className, useDoto = false }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  const baseClasses = useDoto ? "font-doto font-bold" : "font-dm-sans font-semibold"

  const sizeClasses = {
    1: "text-4xl md:text-6xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  }

  return <Tag className={cn(baseClasses, sizeClasses[level], className)}>{children}</Tag>
}
