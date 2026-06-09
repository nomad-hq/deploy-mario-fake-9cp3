"use client"
import Link from "next/link"
import { NomadUserButton } from "@nomad/sdk/react"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/app" className="font-bold text-zinc-900">
          Mario fake
        </Link>
        <Link href="/app" className="text-sm text-zinc-600 hover:text-zinc-900">
          Dashboard
        </Link>
        <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900">
          Pricing
        </Link>
      </div>
      <NomadUserButton
        projectId="cd2f093f-7189-4947-a286-b248d80ce1ac"
        profileUrl="/app/profile"
        afterSignOutUrl="/"
      />
    </nav>
  )
}
