import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Redirect based on user role
  switch (profile.role) {
    case "admin":
      redirect("/dashboard/admin")
    case "professor":
      redirect("/dashboard/professor")
    case "aluno":
      redirect("/dashboard/aluno")
    default:
      redirect("/auth/login")
  }
}
