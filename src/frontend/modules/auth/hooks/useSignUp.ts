import { useMutation } from "@tanstack/react-query"
import { signUp } from "@/services/auth-service"

export function useSignUp() {
  return useMutation({
    mutationFn: signUp,
  })
}
