"use client"

import { useState, type ReactNode } from "react"
import { Bell, LogOut } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useStore, type Role } from "@/lib/store"

const roleLabels: Record<Role, string> = {
  aluno: "Aluno",
  motorista: "Motorista",
  administrador: "Administrador",
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, logout, notifications } = useStore()
  if (!currentUser) return null

  const visible = notifications.filter(
    (n) => n.audience === "todos" || n.audience === currentUser.role,
  )

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand variant="light" />
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsButton count={visible.length} items={visible} />
            <div className="hidden items-center gap-3 sm:flex">
              <Avatar className="size-9 border border-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground/15 text-xs font-semibold text-primary-foreground">
                  {initials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-primary-foreground/70">{roleLabels[currentUser.role]}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              aria-label="Sair"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

function NotificationsButton({
  count,
  items,
}: {
  count: number
  items: { id: string; title: string; message: string; createdAt: string }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            aria-label="Notificações"
          />
        }
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
            {count}
          </span>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificações</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum aviso no momento.</p>
          )}
          {items.map((n) => (
            <div key={n.id} className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground text-balance">{title}</h1>
      {subtitle && <p className="mt-1 text-pretty text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
