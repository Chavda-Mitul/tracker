import { useMutation } from "@tanstack/react-query"
import { logIn } from "@/services/auth-service"

export function useLogIn() {
  return useMutation({
    mutationFn: logIn,
  })
}
