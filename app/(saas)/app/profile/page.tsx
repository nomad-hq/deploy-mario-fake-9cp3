"use client"
import { NomadUserProfile } from "@nomad/sdk/react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <NomadUserProfile projectId="cd2f093f-7189-4947-a286-b248d80ce1ac" afterDeleteUrl="/" />
      </div>
    </div>
  )
}
