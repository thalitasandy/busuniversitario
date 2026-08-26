"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Users,
  Bus,
  Clock,
  AlertTriangle,
  Send,
  Megaphone,
  CheckCircle2,
} from "lucide-react"

import { PageHeading } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useStore,
  todayISO,
  type Driver,
  type Student,
  type Occurrence,
} from "@/lib/store"

const tipoLabel: Record<Occurrence["tipo"], string> = {
  atraso: "Atraso",
  avaria: "Avaria",
  cancelamento: "Cancelamento",
  conclusao: "Viagem concluída",
  outro: "Outro",
}

export function DriverDashboard() {
  const {
    currentUser,
    routes,
    users,
    confirmations,
    occurrences,
    addOccurrence,
    addNotification,
  } = useStore()
  const driver = currentUser as Driver
  const route = routes.find((r) => r.id === driver.routeId)

  const passengers = confirmations
    .filter((c) => c.routeId === driver.routeId && c.date === todayISO())
    .map((c) => {
      const student = users.find((u) => u.id === c.studentId && u.role === "aluno") as Student | undefined
      return student && student.status === "aprovado" ? { student, sentido: c.sentido } : null
    })
    .filter(Boolean) as { student: Student; sentido: string }[]

  const routeOccurrences = occurrences.filter((o) => o.routeId === driver.routeId)
  const ocupacao = route ? Math.round((passengers.length / route.capacidade) * 100) : 0

  return (
    <>
      <PageHeading
        title={`Rota do dia, ${driver.name.split(" ")[0]}`}
        subtitle={`${route?.name ?? ""} · ${new Date().toLocaleDateString("pt-BR")}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Passageiros confirmados" value={String(passengers.length)} hint={`de ${route?.capacidade ?? 0} lugares`} />
        <StatCard icon={Bus} label="Taxa de ocupação" value={`${ocupacao}%`} hint={route?.veiculo ?? ""} />
        <StatCard icon={Clock} label="Horários" value={route?.horarioIda ?? "-"} hint={`Retorno ${route?.horarioVolta ?? "-"}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              Passageiros confirmados para hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passengers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum aluno confirmou presença nesta rota hoje.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {passengers.map(({ student, sentido }) => (
                  <li key={student.id} className="flex items-center gap-3 py-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {student.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {student.curso} · Mat. {student.matricula}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize">{sentido.replace("-", " e ")}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <OccurrenceForm
            onSubmit={(tipo, mensagem) => {
              addOccurrence({ driverId: driver.id, routeId: driver.routeId, date: todayISO(), tipo, mensagem })
              toast.success("Ocorrência registrada.")
            }}
          />
          <CommunicateForm
            onSubmit={(message) => {
              addNotification({
                audience: "aluno",
                routeId: driver.routeId,
                title: `Aviso · ${route?.name ?? "Rota"}`,
                message,
              })
              addOccurrence({ driverId: driver.id, routeId: driver.routeId, date: todayISO(), tipo: "outro", mensagem: `Comunicado aos alunos: ${message}` })
              toast.success("Aviso enviado aos alunos da rota.")
            }}
          />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-primary" />
            Histórico de ocorrências
          </CardTitle>
        </CardHeader>
        <CardContent>
          {routeOccurrences.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>
          ) : (
            <ul className="space-y-3">
              {routeOccurrences.map((o) => (
                <li key={o.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    {o.tipo === "conclusao" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{tipoLabel[o.tipo]}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(o.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{o.mensagem}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-extrabold text-foreground">{value}</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function OccurrenceForm({ onSubmit }: { onSubmit: (tipo: Occurrence["tipo"], mensagem: string) => void }) {
  const [tipo, setTipo] = useState<Occurrence["tipo"]>("conclusao")
  const [mensagem, setMensagem] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-primary" />
          Registrar ocorrência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as Occurrence["tipo"])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tipoLabel).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="occ-msg">Descrição</Label>
          <Textarea
            id="occ-msg"
            placeholder="Ex.: Viagem de ida concluída às 07:05."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          onClick={() => {
            if (!mensagem.trim()) return toast.error("Descreva a ocorrência.")
            onSubmit(tipo, mensagem.trim())
            setMensagem("")
          }}
        >
          <Send className="size-4" /> Registrar
        </Button>
      </CardContent>
    </Card>
  )
}

function CommunicateForm({ onSubmit }: { onSubmit: (message: string) => void }) {
  const [message, setMessage] = useState("")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4 text-primary" />
          Comunicar alunos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Ex.: Atraso de 10 minutos na saída de hoje."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            if (!message.trim()) return toast.error("Escreva uma mensagem.")
            onSubmit(message.trim())
            setMessage("")
          }}
        >
          <Send className="size-4" /> Enviar aviso
        </Button>
      </CardContent>
    </Card>
  )
}
