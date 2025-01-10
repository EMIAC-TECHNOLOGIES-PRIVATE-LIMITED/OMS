import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 rounded-full px-6 py-2 font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        // Outline Button
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 rounded-full px-6 py-2 font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        // Secondary Button
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80 rounded-full px-6 py-2 font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        secondaryFlat: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80 rounded-full px-6 py-2 font-bold transition-all duration-300 ease-in-out border border-transparent focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600",



        // Ghost Button
        ghost:
          "hover:bg-red-200 hover:text-red-900   tedark:hover:bg-slate-800 dark:hover:text-slate-50 rounded-full  px-6 py-2 font-bold transition-all duration-300 ease-in-out",

        // Link Button
        link:
          "text-slate-900 underline underline-offset-4 hover:underline dark:text-slate-50 dark:hover:text-slate-50 transition-all duration-300 ease-in-out",
        brand: "bg-brand text-white  font-bold hover:bg-brand-dark/90 dark:bg-brand-dark dark:hover:bg-brand-dark/80 rounded-full px-6  shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        brandOutline: "bg-white border border-brand text-brand  font-bold hover:bg-brand-light/20 hover:text-brand-dark dark:border-brand-dark dark:text-brand-dark dark:hover:bg-brand-dark/10 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        // Brand Light Button
        brandLight: "bg-brand-light text-white font-bold hover:bg-brand/90 dark:bg-brand-light dark:hover:bg-brand-light/80 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        // Destructive Button
        destructive: "bg-red-600 text-white  font-bold hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        // Destructive Outline Button
        destructiveOutline: "bg-white border border-red-600 text-red-600  font-bold hover:bg-red-50 dark:border-red-700 dark:text-red-700 dark:hover:bg-red-800/10 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        warning: "bg-yellow-400 text-black font-bold hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

        utility: "bg-[#8B4513] text-white  font-bold hover:bg-[#A0522D] dark:bg-[#8B4513] dark:hover:bg-[#A0522D] rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",

      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8  px-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
