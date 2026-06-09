import Link from "next/link"

const features = [
  {
    icon: "⚡",
    title: "Instant setup",
    description: "Sign up and get productive in under a minute. No configuration, no friction.",
  },
  {
    icon: "🔒",
    title: "Secure by default",
    description: "Email verification, OAuth sign-in and session management powered by Nomad.",
  },
  {
    icon: "📈",
    title: "Built to scale",
    description: "From your first user to your millionth — the platform grows with you.",
  },
  {
    icon: "✨",
    title: "Delightful by design",
    description: "A clean, fast interface that gets out of your way so you can focus on the work.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Mario fake</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900">
              Pricing
            </Link>
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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Mario fake
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
          The simplest way to run your work in one place. Secure authentication
          and a dashboard that just works.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} Mario fake. All rights reserved.</span>
          <Link href="/pricing" className="hover:text-zinc-900">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  )
}
