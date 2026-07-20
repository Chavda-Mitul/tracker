import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { LoginForm } from "./components/login-form"

export default function LogInPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-4 sm:p-8">
      <Card className="sketch-card">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Start tracking quests and leveling up your skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.signup} className="font-bold text-ink underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
