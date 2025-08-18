import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        "bg-[hsl(var(--muted))]",
        "dark:bg-[hsl(var(--muted))]",
        // Fallback colors if CSS variables fail
        "bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
