"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 text-5xl" style={{ filter: "url(#sketchy)" }}>
            💥
          </div>
          <CardTitle>A Wild Bug Appeared!</CardTitle>
          <CardDescription>
            Something went wrong while rendering this quest.
            {error.digest ? ` (ref: ${error.digest})` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="accent" onClick={() => unstable_retry()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
