"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/form-field"
import { LoginFormValues } from "@/types/auth"
import { ROUTES } from "@/constants/routes"
import { AUTH_TOKEN_COOKIE } from "@/constants/auth"
import { setCookie } from "@/lib/cookies"
import { useLogIn } from "../hooks/useLogin"

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  })

  const { mutate: logIn, isPending } = useLogIn();

  const onSubmit = (values: LoginFormValues) => {
    logIn(values, {
      onSuccess: ({ token }) => {
        setCookie(AUTH_TOKEN_COOKIE, token)
        router.push(ROUTES.home)
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

      <Field
        id="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        error={errors.email && "Enter a valid email."}
        register={register("email", { required: true })}
      />

      <Field
        id="password"
        type="password"
        label="Password"
        placeholder="At least 8 characters"
        error={errors.password && "Password must be at least 8 characters."}
        register={register("password", { required: true, minLength: 8 })}
      />

      <Button type="submit" variant="accent" className="py-2.5" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
