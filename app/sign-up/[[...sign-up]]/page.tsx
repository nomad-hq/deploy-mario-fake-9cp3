import { NomadSignUp } from "@nomad/sdk/react"

export default function Page() {
  return <NomadSignUp projectId="cd2f093f-7189-4947-a286-b248d80ce1ac" signInUrl="/sign-in" afterSignUpUrl="/verify-email" />
}
