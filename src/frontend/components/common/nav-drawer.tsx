"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "../ui/button"
import { AUTH_TOKEN_COOKIE } from "@/constants/auth"
import { deleteCookie } from "@/lib/cookies"
import { ROUTES } from "@/constants/routes"


const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/task", label: "Task" },
  { href: "/profile", label: "Profile" },
]

export function NavDrawer() {
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie(AUTH_TOKEN_COOKIE)
    router.push(ROUTES.login)
    router.refresh()
  }

  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger className="sketch-btn bg-paper inline-flex size-10 items-center justify-center text-ink">
        <span className="sr-only">Open navigation</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </DrawerTrigger>
      <DrawerContent className="sketch-card !rounded-none border-r-[2.5px]">
        <DrawerHeader>
          <DrawerTitle className="sketch-title">Menu</DrawerTitle>
        </DrawerHeader>
        <nav className="flex flex-col gap-2 p-4">
          {navLinks.map((link) => (
            <DrawerClose
              key={link.href}
              nativeButton={false}
              render={<Link href={link.href} />}
              className="sketch-btn bg-paper px-3 py-2 text-sm font-medium text-ink"
            >
              {link.label}
            </DrawerClose>
          ))}
        </nav>
      <DrawerFooter>
        <DrawerClose
          nativeButton={true}
          render={<Button onClick={handleLogout} variant="accent" className="py-2.5" />}
        >
          Logout
        </DrawerClose>
      </DrawerFooter>
      </DrawerContent>
  
    </Drawer>
  )
}
