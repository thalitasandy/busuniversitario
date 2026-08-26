"use client"

import { useState } from "react"
import {
  MapPin,
  Clock,
  Bus,
  CheckCircle2,
  Hourglass,
  CalendarCheck,
  Bell,
} from "lucide-react"

import { PageHeading } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useStore, todayISO, type Student, type Confirmation } from "@/lib/store"

const sentidoLabel: Record<Confirmation["sentido"], string> = {
  ida: "Somente ida",
  volta: "Somente volta",
  "ida-volta": "Ida e volta",
}

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

export function StudentDashboard() {
  const { currentUser, routes, confirmations, toggleConfirmation } = useStore()
  const student = currentUser as Student
  const route = routes.find((r) => r.id === student.routeId)
  const [sentido, setSentido] = useState<Confirmation["sentido"]>("ida-volta")

  if (student.status !== "aprovado") {
    return (
      <>
        <PageHeading title={`Olá, ${student.name.split(" ")[0]}`} subtitle="Acompanhe seu cadastro." />
        <Card className="border-accent/50 bg-accent/10">
          <CardContent className="flex items-start gap-4 py-6">
            <span className="grid size-11 place-items-center rounded-full bg-accent/30 text-accent-foreground">
              <Hourglass className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Cadastro em análise</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seu cadastro foi enviado e aguarda aprovação do administrador institucional.
                Assim que for validado, você poderá confirmar presença na{" "}
                <span className="font-medium text-foreground">{route?.name}</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  const isConfirmed = (date: string) =>
    confirmations.some((c) => c.studentId === student.id && c.date === date)

  const todayConfirmed = isConfirmed(todayISO())

  return (
    <>
      <PageHeading
        title={`Olá, ${student.name.split(" ")[0]}`}
        subtitle="Confirme sua presença e acompanhe a sua rota."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Confirmação de presença */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="size-4 text-primary" />
              Confirmação de presença
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              className={cn(
                "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                todayConfirmed ? "border-primary/30 bg-primary/5" : "border-border bg-muted/40",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Hoje · {new Date().toLocaleDateString("pt-BR")}</p>
                <p className="text-sm text-muted-foreground">
                  {todayConfirmed ? "Presença confirmada para hoje." : "Você ainda não confirmou o transporte de hoje."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sentido} onValueChange={(v) => setSentido(v as Confirmation["sentido"])}>
                  <SelectTrigger className="w-[150px]" disabled={todayConfirmed}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ida">Somente ida</SelectItem>
                    <SelectItem value="volta">Somente volta</SelectItem>
                    <SelectItem value="ida-volta">Ida e volta</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={todayConfirmed ? "outline" : "default"}
                  onClick={() => toggleConfirmation(student.id, student.routeId, todayISO(), sentido)}
                >
                  {todayConfirmed ? "Cancelar" : "Confirmar"}
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Próximos dias</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {nextDays(8).slice(1).map((d) => {
                  const iso = d.toISOString().slice(0, 10)
                  const confirmed = isConfirmed(iso)
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => toggleConfirmation(student.id, student.routeId, iso, sentido)}
                      className={cn(
                        "flex flex-col items-center rounded-lg border p-3 text-center transition-colors",
                        confirmed
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <span className="text-[11px] font-medium uppercase">
                        {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                      </span>
                      <span className="text-lg font-bold">{d.getDate()}</span>
                      {confirmed && <CheckCircle2 className="mt-1 size-4" />}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Sentido aplicado: <span className="font-medium text-foreground">{sentidoLabel[sentido]}</span>. Toque em um dia para confirmar ou cancelar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rota + dados */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bus className="size-4 text-primary" />
                Minha rota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="font-semibold text-foreground">{route?.name}</p>
              <InfoRow icon={MapPin} label="Origem" value={route?.origem ?? "-"} />
              <InfoRow icon={MapPin} label="Destino" value={route?.destino ?? "-"} />
              <InfoRow icon={Clock} label="Saída (ida)" value={route?.horarioIda ?? "-"} />
              <InfoRow icon={Clock} label="Retorno" value={route?.horarioVolta ?? "-"} />
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Situação do cadastro</span>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  <CheckCircle2 className="mr-1 size-3" /> Aprovado
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="size-4 text-primary" />
                Meus dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Matrícula" value={student.matricula} />
              <InfoRow label="Curso" value={student.curso} />
              <InfoRow label="Instituição" value={student.instituicao} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
