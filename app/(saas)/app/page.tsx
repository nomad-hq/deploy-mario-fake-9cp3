import { getServerUser } from "@/lib/nomad-server"

const demoItems = [
  { name: "Q2 launch checklist", status: "In progress", updated: "2 hours ago" },
  { name: "Customer feedback review", status: "Done", updated: "Yesterday" },
  { name: "Pricing experiment", status: "Draft", updated: "3 days ago" },
  { name: "Onboarding email sequence", status: "In progress", updated: "Last week" },
]

export default async function DashboardPage() {
  const user = await getServerUser()

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Here&apos;s what&apos;s happening in your workspace.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Your SaaS content goes here
        </h2>
        <div className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200">
          {demoItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="mt-0.5 text-xs text-zinc-500">Updated {item.updated}</div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === "Done"
                    ? "bg-emerald-50 text-emerald-700"
                    : item.status === "In progress"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
