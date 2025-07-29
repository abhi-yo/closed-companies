import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
}

export const NeumorphicButton = forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative [box-shadow:0_0_10px_-1px_#00000040] border border-black/50",
          "after:absolute after:content-[''] after:inset-0 after:border-[#2A2A2A] bg-[#212121]",
          "flex items-center justify-center w-max [&>div]:hover:translate-y-1",
          "after:border-t-[3px] after:border-b-[3px] after:border-b-black/50",
          "after:hover:border-b-0 after:border-r-0 after:hover:border-t-black/50",
          "after:hover:[box-shadow:0_5px_15px_0_#00000070_inset]",
          "rounded-2xl after:rounded-2xl overflow-hidden",
          "font-dm-sans font-medium text-white",
          "transition-all duration-300 ease-in-out",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-center p-0 gap-2">
          {children}
        </div>
      </button>
    )
  },
)

NeumorphicButton.displayName = "NeumorphicButton"
