import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SignUpForm } from "@/modules/auth/components/sign-up-form"
import { ROUTES } from "@/constants/routes"

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-4 sm:p-8">
      <Card className="sketch-card">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Start tracking quests and leveling up your skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-bold text-ink underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
