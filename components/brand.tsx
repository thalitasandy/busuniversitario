import { cn } from "@/lib/utils"

export function Brand({
  className,
  variant = "dark",
  showTagline = false,
}: {
  className?: string
  variant?: "dark" | "light"
  showTagline?: boolean
}) {
  const isLight = variant === "light"
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center overflow-hidden rounded-full ring-1",
          isLight ? "bg-primary-foreground ring-primary-foreground/40" : "bg-primary ring-border",
        )}
      >
        <img
          src="/logo-pombal.jpg"
          alt="Emblema Bus Universitário Pombal"
          className="size-full object-cover"
        />
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            "text-sm font-extrabold tracking-tight",
            isLight ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Bus Universitário
        </p>
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            isLight ? "text-primary-foreground/70" : "text-accent-foreground/70",
          )}
        >
          Pombal
        </p>
        {showTagline && (
          <p className="mt-1 text-xs text-muted-foreground">Transporte universitário integrado</p>
        )}
      </div>
    </div>
  )
}
