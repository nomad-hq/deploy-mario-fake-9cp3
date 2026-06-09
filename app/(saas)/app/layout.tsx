import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/nomad-server"
import { Navbar } from "@/components/Navbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user) redirect("/sign-in")
  // No access to the app until the email is verified.
  if (!user.emailVerified) redirect("/verify-email")
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  )
}
