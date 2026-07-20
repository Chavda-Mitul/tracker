import { apiClient } from "@/lib/api-client"
import { AuthUser, LoginFormValues, SignUpFormValues } from "@/types/auth"

export async function signUp(values: SignUpFormValues): Promise<{ token: string; user: AuthUser }> {
  return apiClient.post("/auth/signup", values)
}

export async function logIn(values: LoginFormValues): Promise<{ token: string; user: AuthUser }> {
  return apiClient.post("/auth/login", values)
}

