import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      {/* 1. Added w-full to make it take up the container's width, and max-w-md to keep it looking clean on desktop */}
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 text-6xl" style={{ filter: "url(#sketchy)" }}>
            🗺️
          </div>
          <CardTitle>Quest Not Found</CardTitle>
          <CardDescription>This route doesn&apos;t exist on the map.</CardDescription>
        </CardHeader>
        {/* 2. Added w-full to the content wrapper, Link, and Button so the button stretches too */}
        <CardContent className="flex justify-center w-full">
          <Link href="/" className="w-full">
            <Button variant="accent" className="w-full">
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}