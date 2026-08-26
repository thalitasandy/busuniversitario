"use client"

import { StoreProvider, useStore } from "@/lib/store"
import { Toaster } from "@/components/ui/sonner"
import { AuthScreen } from "@/components/auth-screen"
import { AppShell } from "@/components/app-shell"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { DriverDashboard } from "@/components/dashboards/driver-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

function Router() {
  const { currentUser } = useStore()

  if (!currentUser) return <AuthScreen />

  return (
    <AppShell>
      {currentUser.role === "aluno" && <StudentDashboard />}
      {currentUser.role === "motorista" && <DriverDashboard />}
      {currentUser.role === "administrador" && <AdminDashboard />}
    </AppShell>
  )
}

export default function Page() {
  return (
    <StoreProvider>
      <Router />
      <Toaster richColors position="top-center" />
    </StoreProvider>
  )
}
