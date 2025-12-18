import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "danger" | "secondary" | "gold" | "green"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const variants = {
            default: "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20",
            // Gold Variant (from Ranking Challenge)
            gold: "bg-gradient-to-b from-[var(--color-gold-start)] to-[var(--color-gold-end)] text-white shadow-[0_0_15px_rgba(194,178,0,0.2)] border-t border-white/20 hover:opacity-90",
            // Green Variant (from Ranking Challenge)
            green: "bg-gradient-to-b from-[var(--color-green-start)] to-[var(--color-green-end)] text-white shadow-[0_0_15px_rgba(35,122,87,0.2)] border-t border-white/10 hover:opacity-90",

            outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
            ghost: "bg-[#242424] hover:bg-[#2a2a2a] text-white/50 hover:text-white border border-white/5 shadow-inner",
            danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:opacity-90 shadow-lg shadow-red-500/20",
            secondary: "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600",
        }

        const sizes = {
            default: "h-11 px-5 py-2",
            sm: "h-9 rounded-md px-3 text-xs",
            lg: "h-12 rounded-lg px-8 text-base",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
