import type { Metadata } from "next"
import { NomadPreviewBanner } from "@nomad/sdk/react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mario fake",
  description: "Mario fake — your new favorite SaaS, hosted on Nomad.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">
        <NomadPreviewBanner projectId="cd2f093f-7189-4947-a286-b248d80ce1ac" />
        {children}
      </body>
    </html>
  )
}
