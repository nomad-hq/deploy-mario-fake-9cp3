'use client'
import Link from 'next/link'
import { NomadPricing } from '@nomad/sdk/react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Mario fake
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/sign-in" className="text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700 }}>Pricing</h1>
        <p style={{ textAlign: 'center', color: '#71717a', marginBottom: 32 }}>
          Choose the plan that fits you.
        </p>
        <NomadPricing projectId="cd2f093f-7189-4947-a286-b248d80ce1ac" />
      </main>
    </div>
  )
}
