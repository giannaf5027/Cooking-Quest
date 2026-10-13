"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { useEffect, useState } from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false)

  // Ensure theme is applied after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="py-6 border-t">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} CookMama. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="/about" className="text-sm text-muted-foreground hover:underline">
                  About
                </a>
                <a href="/privacy" className="text-sm text-muted-foreground hover:underline">
                  Privacy
                </a>
                <a href="/terms" className="text-sm text-muted-foreground hover:underline">
                  Terms
                </a>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}
