import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import SidebarWrapper from "@/components/SidebarWrapper"
import { SidebarTrigger } from "@/components/ui/sidebar"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StudentBot - Health & Career Guidance",
  description: "AI-powered chatbot for student health and career guidance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <SidebarWrapper />
              <main className="flex-1 w-full">{children}</main>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
