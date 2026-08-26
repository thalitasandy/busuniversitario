"use client"

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"

/* ------------------------------ Tipos ------------------------------ */

export type Role = "aluno" | "motorista" | "administrador"

export type UserStatus = "pendente" | "aprovado" | "rejeitado"

export interface BaseUser {
  id: string
  role: Role
  name: string
  email: string
  password: string
  createdAt: string
}

export interface Student extends BaseUser {
  role: "aluno"
  matricula: string
  curso: string
  instituicao: string
  routeId: string
  status: UserStatus
}

export interface Driver extends BaseUser {
  role: "motorista"
  cnh: string
  veiculo: string
  routeId: string
  status: UserStatus
}

export interface Admin extends BaseUser {
  role: "administrador"
  instituicao: string
  status: UserStatus
}

export type AppUser = Student | Driver | Admin

export interface Route {
  id: string
  name: string
  origem: string
  destino: string
  horarioIda: string
  horarioVolta: string
  veiculo: string
  capacidade: number
  paradas: string[]
}

export interface Confirmation {
  id: string
  studentId: string
  routeId: string
  date: string // YYYY-MM-DD
  sentido: "ida" | "volta" | "ida-volta"
}

export interface Occurrence {
  id: string
  driverId: string
  routeId: string
  date: string
  tipo: "atraso" | "avaria" | "cancelamento" | "conclusao" | "outro"
  mensagem: string
}

export interface Notification {
  id: string
  audience: "todos" | Role
  routeId?: string
  title: string
  message: string
  createdAt: string
  /** ids dos usuários que já visualizaram (a notificação some para eles) */
  readBy: string[]
}

interface State {
  users: AppUser[]
  routes: Route[]
  confirmations: Confirmation[]
  occurrences: Occurrence[]
  notifications: Notification[]
  sessionId: string | null
}

/* ------------------------------ Utilidades ------------------------------ */

export const INSTITUICOES = [
  "UEPB - Campus VII (Patos)",
  "UFCG (Patos)",
  "UNIFIP (Patos)",
]

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const uid = () => Math.random().toString(36).slice(2, 10)

/* ------------------------------ Seed ------------------------------ */

const seedRoutes: Route[] = [
  {
    id: "r1",
    name: "Rota 1 · Pombal → UEPB (Campus VII)",
    origem: "Terminal Rodoviário de Pombal",
    destino: "UEPB - Campus VII, Patos",
    horarioIda: "17:00",
    horarioVolta: "22:00",
    veiculo: "Ônibus 01 - ABC-1D23",
    capacidade: 46,
    paradas: ["Terminal Rodoviário de Pombal", "UEPB - Campus VII, Patos"],
  },
  {
    id: "r2",
    name: "Rota 2 · Pombal → UFCG",
    origem: "Terminal Rodoviário de Pombal",
    destino: "UFCG, Patos",
    horarioIda: "16:30",
    horarioVolta: "22:00",
    veiculo: "Ônibus 02 - EFG-4H56",
    capacidade: 42,
    paradas: ["Terminal Rodoviário de Pombal", "UFCG, Patos"],
  },
  {
    id: "r3",
    name: "Rota 3 · Pombal → UNIFIP",
    origem: "Terminal Rodoviário de Pombal",
    destino: "UNIFIP, Patos",
    horarioIda: "17:00",
    horarioVolta: "22:00",
    veiculo: "Ônibus 03 - IJK-7L89",
    capacidade: 40,
    paradas: ["Terminal Rodoviário de Pombal", "UNIFIP, Patos"],
  },
]

const seedUsers: AppUser[] = [
  {
    id: "u-admin",
    role: "administrador",
    name: "Ana Coordenação",
    email: "admin@pombal.edu.br",
    password: "123456",
    instituicao: "UEPB - Campus VII (Patos)",
    status: "aprovado",
    createdAt: "2025-07-01",
  },
  {
    id: "u-driver",
    role: "motorista",
    name: "Carlos Motorista",
    email: "motorista@pombal.edu.br",
    password: "123456",
    cnh: "01234567890",
    veiculo: "Ônibus 01 - ABC-1D23",
    routeId: "r1",
    status: "aprovado",
    createdAt: "2025-07-02",
  },
  {
    id: "u-aluno",
    role: "aluno",
    name: "Marina Silva",
    email: "aluno@pombal.edu.br",
    password: "123456",
    matricula: "20231045",
    curso: "Engenharia de Produção",
    instituicao: "UEPB - Campus VII (Patos)",
    routeId: "r1",
    status: "aprovado",
    createdAt: "2025-07-03",
  },
  {
    id: "u-aluno2",
    role: "aluno",
    name: "João Pedro",
    email: "joao@pombal.edu.br",
    password: "123456",
    matricula: "20231099",
    curso: "Ciência da Computação",
    instituicao: "UFCG (Patos)",
    routeId: "r2",
    status: "pendente",
    createdAt: "2025-07-28",
  },
  {
    id: "u-aluno3",
    role: "aluno",
    name: "Beatriz Alves",
    email: "bia@pombal.edu.br",
    password: "123456",
    matricula: "20231120",
    curso: "Agronomia",
    instituicao: "UFCG - Campus Pombal",
    routeId: "r1",
    status: "aprovado",
    createdAt: "2025-07-15",
  },
]

const seedConfirmations: Confirmation[] = [
  { id: uid(), studentId: "u-aluno", routeId: "r1", date: todayISO(), sentido: "ida-volta" },
  { id: uid(), studentId: "u-aluno3", routeId: "r1", date: todayISO(), sentido: "ida" },
]

const initialState: State = {
  users: seedUsers,
  routes: seedRoutes,
  confirmations: seedConfirmations,
  occurrences: [
    {
      id: uid(),
      driverId: "u-driver",
      routeId: "r1",
      date: todayISO(),
      tipo: "conclusao",
      mensagem: "Viagem de ida concluída sem intercorrências.",
    },
  ],
  notifications: [
    {
      id: uid(),
      audience: "aluno",
      routeId: "r1",
      title: "Ajuste de horário",
      message: "A saída de amanhã da Rota Centro → UFCG será às 06:35.",
      createdAt: new Date().toISOString(),
    },
  ],
  sessionId: "u-aluno",
}

/* ------------------------------ Reducer ------------------------------ */

type Action =
  | { type: "LOGIN"; email: string; password: string }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; user: AppUser }
  | { type: "SET_STATUS"; userId: string; status: UserStatus }
  | { type: "TOGGLE_CONFIRMATION"; studentId: string; routeId: string; date: string; sentido: Confirmation["sentido"] }
  | { type: "ADD_OCCURRENCE"; occurrence: Occurrence }
  | { type: "ADD_ROUTE"; route: Route }
  | { type: "ADD_NOTIFICATION"; notification: Notification }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN": {
      const user = state.users.find(
        (u) => u.email.toLowerCase() === action.email.toLowerCase() && u.password === action.password,
      )
      if (!user) return state
      return { ...state, sessionId: user.id }
    }
    case "LOGOUT":
      return { ...state, sessionId: null }
    case "REGISTER":
      return { ...state, users: [...state.users, action.user], sessionId: action.user.id }
    case "SET_STATUS":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.userId ? { ...u, status: action.status } : u)),
      }
    case "TOGGLE_CONFIRMATION": {
      const existing = state.confirmations.find(
        (c) => c.studentId === action.studentId && c.date === action.date,
      )
      if (existing) {
        return {
          ...state,
          confirmations: state.confirmations.filter((c) => c.id !== existing.id),
        }
      }
      return {
        ...state,
        confirmations: [
          ...state.confirmations,
          { id: uid(), studentId: action.studentId, routeId: action.routeId, date: action.date, sentido: action.sentido },
        ],
      }
    }
    case "ADD_OCCURRENCE":
      return { ...state, occurrences: [action.occurrence, ...state.occurrences] }
    case "ADD_ROUTE":
      return { ...state, routes: [...state.routes, action.route] }
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.notification, ...state.notifications] }
    default:
      return state
  }
}

/* ------------------------------ Context ------------------------------ */

interface StoreContextValue extends State {
  currentUser: AppUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (user: Omit<AppUser, "id" | "createdAt">) => AppUser
  setStatus: (userId: string, status: UserStatus) => void
  toggleConfirmation: (studentId: string, routeId: string, date: string, sentido: Confirmation["sentido"]) => void
  addOccurrence: (o: Omit<Occurrence, "id">) => void
  addRoute: (r: Omit<Route, "id">) => void
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void
  emailExists: (email: string) => boolean
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo<StoreContextValue>(() => {
    const currentUser = state.users.find((u) => u.id === state.sessionId) ?? null
    return {
      ...state,
      currentUser,
      emailExists: (email) => state.users.some((u) => u.email.toLowerCase() === email.toLowerCase()),
      login: (email, password) => {
        const user = state.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
        )
        dispatch({ type: "LOGIN", email, password })
        return Boolean(user)
      },
      logout: () => dispatch({ type: "LOGOUT" }),
      register: (partial) => {
        const user = { ...partial, id: uid(), createdAt: todayISO() } as AppUser
        dispatch({ type: "REGISTER", user })
        return user
      },
      setStatus: (userId, status) => dispatch({ type: "SET_STATUS", userId, status }),
      toggleConfirmation: (studentId, routeId, date, sentido) =>
        dispatch({ type: "TOGGLE_CONFIRMATION", studentId, routeId, date, sentido }),
      addOccurrence: (o) => dispatch({ type: "ADD_OCCURRENCE", occurrence: { ...o, id: uid() } }),
      addRoute: (r) => dispatch({ type: "ADD_ROUTE", route: { ...r, id: uid() } }),
      addNotification: (n) =>
        dispatch({
          type: "ADD_NOTIFICATION",
          notification: { ...n, id: uid(), createdAt: new Date().toISOString() },
        }),
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider")
  return ctx
}
