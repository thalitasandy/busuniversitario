"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import {
  GraduationCap,
  BusFront,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
} from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { INSTITUICOES, useStore, type Role, type AppUser } from "@/lib/store"

const roles: { value: Role; label: string; icon: typeof GraduationCap; desc: string }[] = [
  { value: "aluno", label: "Aluno", icon: GraduationCap, desc: "Confirme presença e acompanhe sua rota" },
  { value: "motorista", label: "Motorista", icon: BusFront, desc: "Veja passageiros e registre a viagem" },
  { value: "administrador", label: "Administrador", icon: ShieldCheck, desc: "Aprove cadastros e gerencie a operação" },
]

export function AuthScreen() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AuthAside />
      <div className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Brand className="mb-8 lg:hidden" />
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="cadastro" className="mt-6">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-primary lg:block">
      <Image
        src="/campus-bus.png"
        alt="Ônibus universitário no campus de Pombal"
        fill
        priority
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/85 to-primary" />
      <div className="relative flex h-full flex-col justify-between p-12">
        <Brand variant="light" />
        <div className="max-w-md">
          <h1 className="text-balance text-4xl font-extrabold leading-tight text-primary-foreground">
            Transporte universitário de Pombal, organizado do embarque à chegada.
          </h1>
          <p className="mt-4 text-pretty text-primary-foreground/75">
            Cadastro por perfil, confirmação diária de presença, controle de rotas e
            indicadores de ocupação em uma única plataforma.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Vinculação do aluno à instituição e rota",
              "Aprovação de cadastros pelo administrador",
              "Lista de passageiros confirmados para o motorista",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <CheckCircle2 className="size-5 shrink-0 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs text-primary-foreground/60">
          <Lock className="size-3.5" aria-hidden="true" />
          Dados tratados conforme a LGPD — criptografia e controle de acesso por perfil.
        </p>
      </div>
    </aside>
  )
}

function LoginForm() {
  const { login } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = login(email, password)
    if (!ok) toast.error("E-mail ou senha inválidos.")
    else toast.success("Bem-vindo(a) de volta!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Acessar plataforma</h2>
        <p className="text-sm text-muted-foreground">Entre com suas credenciais institucionais.</p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="voce@instituicao.edu.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        Entrar
        <ArrowRight className="size-4" />
      </Button>

      <DemoAccounts onPick={(e, p) => { setEmail(e); setPassword(p) }} />
    </form>
  )
}

function DemoAccounts({ onPick }: { onPick: (email: string, pass: string) => void }) {
  const demos = [
    { label: "Aluno", email: "aluno@pombal.edu.br" },
    { label: "Motorista", email: "motorista@pombal.edu.br" },
    { label: "Admin", email: "admin@pombal.edu.br" },
  ]
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4">
      <p className="text-xs font-semibold text-muted-foreground">Contas de demonstração (senha: 123456)</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {demos.map((d) => (
          <button
            key={d.email}
            type="button"
            onClick={() => onPick(d.email, "123456")}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function RegisterForm() {
  const { register, emailExists, routes } = useStore()
  const [role, setRole] = useState<Role>("aluno")
  const [form, setForm] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (emailExists(form.email ?? "")) {
      toast.error("Já existe uma conta com este e-mail.")
      return
    }

    let user: Omit<AppUser, "id" | "createdAt">
    if (role === "aluno") {
      user = {
        role: "aluno",
        name: form.name,
        email: form.email,
        password: form.password,
        matricula: form.matricula,
        curso: form.curso,
        instituicao: form.instituicao ?? INSTITUICOES[0],
        routeId: form.routeId ?? routes[0].id,
        status: "pendente",
      }
    } else if (role === "motorista") {
      user = {
        role: "motorista",
        name: form.name,
        email: form.email,
        password: form.password,
        cnh: form.cnh,
        veiculo: form.veiculo,
        routeId: form.routeId ?? routes[0].id,
        status: "pendente",
      }
    } else {
      user = {
        role: "administrador",
        name: form.name,
        email: form.email,
        password: form.password,
        instituicao: form.instituicao ?? INSTITUICOES[0],
        status: "pendente",
      }
    }

    register(user)
    toast.success("Cadastro enviado! Aguarde a aprovação do administrador.")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Criar cadastro</h2>
        <p className="text-sm text-muted-foreground">Selecione seu perfil e preencha os dados.</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {roles.map((r) => {
          const Icon = r.icon
          const active = role === r.value
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
              aria-pressed={active}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-xs font-semibold">{r.label}</span>
            </button>
          )
        })}
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{roles.find((r) => r.value === role)?.desc}</p>

      <div className="grid gap-4">
        <Field id="name" label="Nome completo" value={form.name} onChange={(v) => set("name", v)} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="email" label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} required />
          <Field id="password" label="Senha" type="password" value={form.password} onChange={(v) => set("password", v)} required />
        </div>

        {role === "aluno" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="matricula" label="Matrícula" value={form.matricula} onChange={(v) => set("matricula", v)} required />
              <Field id="curso" label="Curso" value={form.curso} onChange={(v) => set("curso", v)} required />
            </div>
            <SelectField
              label="Instituição de ensino"
              placeholder="Selecione a instituição"
              value={form.instituicao}
              onChange={(v) => set("instituicao", v)}
              options={INSTITUICOES.map((i) => ({ value: i, label: i }))}
            />
            <SelectField
              label="Rota desejada"
              placeholder="Selecione a rota"
              value={form.routeId}
              onChange={(v) => set("routeId", v)}
              options={routes.map((r) => ({ value: r.id, label: r.name }))}
            />
          </>
        )}

        {role === "motorista" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="cnh" label="Nº da CNH" value={form.cnh} onChange={(v) => set("cnh", v)} required />
              <Field id="veiculo" label="Veículo / placa" value={form.veiculo} onChange={(v) => set("veiculo", v)} required />
            </div>
            <SelectField
              label="Rota atribuída"
              placeholder="Selecione a rota"
              value={form.routeId}
              onChange={(v) => set("routeId", v)}
              options={routes.map((r) => ({ value: r.id, label: r.name }))}
            />
          </>
        )}

        {role === "administrador" && (
          <SelectField
            label="Instituição"
            placeholder="Selecione a instituição"
            value={form.instituicao}
            onChange={(v) => set("instituicao", v)}
            options={INSTITUICOES.map((i) => ({ value: i, label: i }))}
          />
        )}
      </div>

      <Button type="submit" className="w-full" size="lg">
        Enviar cadastro
        <ArrowRight className="size-4" />
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Seu acesso às rotas é liberado após aprovação do administrador institucional.
      </p>
    </form>
  )
}

function Field({
  id,
  label,
  value = "",
  onChange,
  type = "text",
  required,
}: {
  id: string
  label: string
  value?: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  )
}

function SelectField({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string
  placeholder: string
  value?: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
