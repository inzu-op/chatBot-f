"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Save, RefreshCw, Moon, Sun, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: {
    name: string
    email: string
  }
  setProfile: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>
}

export function SettingsDialog({ open, onOpenChange, profile, setProfile }: SettingsDialogProps) {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const router = useRouter();

  const handleSaveProfile = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile))
    toast({
      title: "Success",
      description: "Profile updated successfully",
    })
    onOpenChange(false)
  }

  const handleResetChat = () => {
    window.location.reload()
    toast({
      title: "Chat Reset",
      description: "Starting a new conversation",
    })
    onOpenChange(false)
  }

  // Logout
  const handleLogout = async () => {
    const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs");
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
    router.push("/ ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full  max-w-3xl max-h-[90vh] grid grid-rows-[auto,1fr,auto] p-6 sm:p-0 bg-[hsl(var(--custom-bg))] dark:bg-background text-xs">
        <DialogHeader className="p-4 sm:p-6 text-xs">
          <DialogTitle className=" sm:text-2xl font-bold text-xs">Settings</DialogTitle>
          <DialogDescription className="text-xs">
            Manage your profile, preferences, and application settings.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-2 sm:px-6 space-y-8 pb-4 sm:pb-6">
          {/* Profile Section */}
          <section>
            <h2 className=" sm:text-xl font-semibold flex items-center gap-3 mb-4 text-xs">
              <User className="h-5 w-5" />
              Profile Information
            </h2>
            <Separator />
            <div className="mt-6 space-y-6">
           

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold text-xs">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    className="text-xs placeholder:text-[10px] sm:placeholder:text-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-xs">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    className="text-xs placeholder:text-[10px] md:placeholder:text-md"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h2 className=" sm:text-xl font-semibold flex items-center gap-3 mb-4 text-xs">
              <Bell className="h-5 w-5" />
              Preferences
            </h2>
            <Separator />
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="theme-switch" className="font-medium text-xs">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark themes.
                  </p>
                </div>
                <Switch
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>
          </section>

          {/* Chat Actions */}
          <section>
            <h2 className=" sm:text-xl font-semibold flex items-center gap-3 mb-4 text-destructive text-xs">
              <RefreshCw className="h-5 w-5" />
              Danger Zone
            </h2>
            <Separator />
            <div className="mt-6 space-y-4">
              {/* Placeholder for new feature/section */}
              <div className="flex items-center justify-between p-4 border border-muted rounded-lg bg-[hsl(var(--custom-bg))] dark:bg-muted/10">
                <div>
                  <h4 className="font-medium text-xs">[Your New Feature]</h4>
                  <p className="text-xs text-muted-foreground">Describe your new feature here.</p>
                </div>
                <Button variant="outline" disabled>
                  Action
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-muted rounded-lg  bg-[hsl(var(--custom-bg))] dark:bg-muted/10">
                <div>
                  <h4 className="font-medium text-xs">Logout</h4>
                  <p className="text-xs text-muted-foreground">Sign out of your account.</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </section>
        </div>
        <DialogFooter className="p-6 bg-secondary/50 border-t text-xs">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
