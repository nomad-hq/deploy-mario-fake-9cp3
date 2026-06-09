import { createNomadClient } from "@nomad/sdk"

export const nomad = createNomadClient({
  projectId: "cd2f093f-7189-4947-a286-b248d80ce1ac",
  baseUrl: "https://nomad.red",
})
