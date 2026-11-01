import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-(--card-radius) border border-ink dither-dots", className)}
      {...props}
    />
  )
}

export { Skeleton }
