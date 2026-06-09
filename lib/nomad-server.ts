import { cookies } from "next/headers"

const NOMAD_BASE = "https://nomad.red"
const PROJECT_ID = "cd2f093f-7189-4947-a286-b248d80ce1ac"

export type ServerUser = {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
}

export async function getServerUser(): Promise<ServerUser | null> {
  const token = (await cookies()).get("nomad_token")?.value
  if (!token) return null
  const res = await fetch(`${NOMAD_BASE}/api/sdk/v1/auth/me`, {
    headers: {
      "X-Nomad-Project-Id": PROJECT_ID,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.user as ServerUser
}
