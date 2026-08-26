"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Users,
  Route as RouteIcon,
  TrendingUp,
  Check,
  X,
  Megaphone,
  Send,
  Plus,
  MapPin,
} from "lucide-react"

import { PageHeading } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useStore, todayISO, type Student, type Role } from "@/lib/store"

const roleLabel: Record<Role, string> = {
  aluno: "Aluno",
  motorista: "Motorista",
  administrador: "Administrador",
}

export function AdminDashboard() {
  const { currentUser, users, routes, confirmations, setStatus } = useStore()

  const students = users.filter((u) => u.role === "aluno") as Student[]
  const approvedStudents = students.filter((s) => s.status === "aprovado")
  const pending = users.filter((u) => u.status === "pendente")
  const todayConfirmations = confirmations.filter((c) => c.date === todayISO())

  const totalCapacity = routes.reduce((sum, r) => sum + r.capacidade, 0)
  const ocupacaoGeral = totalCapacity ? Math.round((todayConfirmations.length / totalCapacity) * 100) : 0
  const aderencia = approvedStudents.length
    ? Math.round(
        (new Set(todayConfirmations.map((c) => c.studentId)).size / approvedStudents.length) * 100,
      )
    : 0

  // rotas mais utilizadas
  const routeUsage = routes
    .map((r) => ({
      route: r,
      confirmed: todayConfirmations.filter((c) => c.routeId === r.id).length,
    }))
    .sort((a, b) => b.confirmed - a.confirmed)

  return (
    <>
      <PageHeading
        title={`Painel gerencial, ${currentUser?.name.split(" ")[0]}`}
        subtitle="Indicadores de ocupação, aprovação de cadastros e gestão de rotas."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Ocupação de hoje" value={`${ocupacaoGeral}%`} hint={`${todayConfirmations.length} de ${totalCapacity} lugares`} />
        <StatCard icon={Users} label="Aderência dos alunos" value={`${aderencia}%`} hint="confirmaram hoje" />
        <StatCard icon={RouteIcon} label="Rotas ativas" value={String(routes.length)} hint={`${approvedStudents.length} alunos aprovados`} />
        <StatCard icon={Users} label="Aprovações pendentes" value={String(pending.length)} hint="aguardando validação" accent={pending.length > 0} />
      </div>

      <Tabs defaultValue="indicadores">
        <TabsList>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="aprovacoes">
            Aprovações {pending.length > 0 && <span className="ml-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="rotas">Rotas</TabsTrigger>
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
        </TabsList>

        {/* Indicadores */}
        <TabsContent value="indicadores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rotas mais utilizadas hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {routeUsage.map(({ route, confirmed }) => {
                const pct = Math.round((confirmed / route.capacidade) * 100)
                return (
                  <div key={route.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{route.name}</span>
                      <span className="text-muted-foreground">
                        {confirmed}/{route.capacidade} · {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", pct > 85 ? "bg-destructive" : "bg-primary")}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-muted-foreground">
                Rotas acima de 85% de ocupação sugerem realocação de veículo ou ajuste de horário.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aprovações */}
        <TabsContent value="aprovacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cadastros aguardando aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum cadastro pendente. Tudo em dia!
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {pending.map((u) => (
                    <li key={u.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{u.name}</p>
                          <Badge variant="secondary">{roleLabel[u.role]}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {u.role === "aluno"
                            ? `${(u as Student).curso} · Mat. ${(u as Student).matricula} · ${(u as Student).instituicao}`
                            : u.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setStatus(u.id, "aprovado")
                            toast.success(`${u.name} aprovado(a).`)
                          }}
                        >
                          <Check className="size-4" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStatus(u.id, "rejeitado")
                            toast(`Cadastro de ${u.name} rejeitado.`)
                          }}
                        >
                          <X className="size-4" /> Rejeitar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rotas */}
        <TabsContent value="rotas" className="mt-6">
          <div className="mb-4 flex justify-end">
            <NewRouteDialog />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {routes.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {r.name}
                    <Badge variant="secondary">{r.capacidade} lug.</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row icon={MapPin} label="Trajeto" value={`${r.origem} → ${r.destino}`} />
                  <Row label="Horários" value={`Ida ${r.horarioIda} · Volta ${r.horarioVolta}`} />
                  <Row label="Veículo" value={r.veiculo} />
                  <Separator />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.paradas.map((p) => (
                      <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Avisos */}
        <TabsContent value="avisos" className="mt-6">
          <NotificationForm />
        </TabsContent>
      </Tabs>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <Card className={cn(accent && "border-accent/60 bg-accent/10")}>
      <CardContent className="flex items-center gap-4 py-5">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl",
            accent ? "bg-accent/30 text-accent-foreground" : "bg-primary/10 text-primary",
          )}
        >
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

function Row({ icon: Icon, label, value }: { icon?: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function NewRouteDialog() {
  const { addRoute } = useStore()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> Nova rota
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar rota</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <FieldMini id="name" label="Nome da rota" onChange={(v) => set("name", v)} />
          <div className="grid grid-cols-2 gap-4">
            <FieldMini id="origem" label="Origem" onChange={(v) => set("origem", v)} />
            <FieldMini id="destino" label="Destino" onChange={(v) => set("destino", v)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FieldMini id="ida" label="Ida" placeholder="06:30" onChange={(v) => set("horarioIda", v)} />
            <FieldMini id="volta" label="Volta" placeholder="17:40" onChange={(v) => set("horarioVolta", v)} />
            <FieldMini id="cap" label="Capacidade" placeholder="46" onChange={(v) => set("capacidade", v)} />
          </div>
          <FieldMini id="veiculo" label="Veículo / placa" onChange={(v) => set("veiculo", v)} />
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!f.name || !f.origem || !f.destino) return toast.error("Preencha nome, origem e destino.")
              addRoute({
                name: f.name,
                origem: f.origem,
                destino: f.destino,
                horarioIda: f.horarioIda || "06:30",
                horarioVolta: f.horarioVolta || "17:40",
                veiculo: f.veiculo || "A definir",
                capacidade: Number(f.capacidade) || 40,
                paradas: [f.origem, f.destino],
              })
              toast.success("Rota cadastrada.")
              setF({})
              setOpen(false)
            }}
          >
            Salvar rota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FieldMini({
  id,
  label,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function NotificationForm() {
  const { addNotification } = useStore()
  const [audience, setAudience] = useState<"todos" | Role>("todos")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4 text-primary" />
          Enviar aviso / notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Destinatários</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v as "todos" | Role)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os usuários</SelectItem>
                <SelectItem value="aluno">Somente alunos</SelectItem>
                <SelectItem value="motorista">Somente motoristas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notif-title">Título</Label>
            <Input id="notif-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Alteração de horário" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notif-msg">Mensagem</Label>
          <Textarea id="notif-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Descreva o aviso a ser enviado." />
        </div>
        <div>
          <Button
            onClick={() => {
              if (!title.trim() || !message.trim()) return toast.error("Preencha título e mensagem.")
              addNotification({ audience, title: title.trim(), message: message.trim() })
              toast.success("Aviso enviado.")
              setTitle("")
              setMessage("")
            }}
          >
            <Send className="size-4" /> Enviar aviso
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
