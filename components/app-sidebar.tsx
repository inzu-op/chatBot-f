"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Settings, Sparkles, Info, X } from "lucide-react"
import { useState, useEffect } from "react"
import { SettingsDialog } from "@/components/settings-dialog"
import supabase from "@/utils/supabase/client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function AppSidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: "Student User",
    email: "student@example.com",
  })
  const [chats, setChats] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<any>(null);

  const fetchUserAndChats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    setUserId(user?.id || null);

    if (user) {
      setUserProfile({
        name: user.user_metadata?.name || user.email || "Student User",
        email: user.email || "student@example.com"
      });
    } else {
      setUserProfile({ name: "Student User", email: "student@example.com" });
    }

    if (user?.id) {
      try {
        const response = await fetch(`http://localhost:3001/api/chats?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setChats(data.chats || []);
        } else {
          setChats([]);
        }
      } catch (error) {
        setChats([]);
      }
    } else {
      setChats([]);
    }
  }

  useEffect(() => {
    fetchUserAndChats();
  }, [supabase]);

  useEffect(() => {
    const handleNewChat = () => fetchUserAndChats();
    window.addEventListener('newChatCreated', handleNewChat)
    return () => window.removeEventListener('newChatCreated', handleNewChat)
  }, [])

  const startNewChat = async () => {
    const newChatId = uuidv4();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
        // You might want to show a toast message to the user
        console.error("User not authenticated");
        return;
    };

    // Simply navigate to the new chat URL.
    // The chat page will handle the creation logic when the first message is sent.
    router.push(`/${userId}/chat/${newChatId}`);
  };

  const handleDeleteChat = async (chatId: string) => {
    await fetch(`http://localhost:3001/api/chats/${chatId}`, { method: 'DELETE' });
    setDeleteDialogOpen(false);
    setChatToDelete(null);
    fetchUserAndChats();
  };

  return (
    <>
      <Sidebar variant="inset" className="z-10 border border-gray-600 dark:border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            {/* <SidebarTrigger />/ */}
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Student-Assistant</span>
          </div>
        </SidebarHeader>

        <SidebarContent >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Button onClick={startNewChat} className="w-full justify-start gap-2  bg-[hsl(var(--custom-bg))] dark:bg-zinc-800 hover:bg-[#c7aef6] dark:hover:bg-muted transition-colors font-sans font-semibold" variant="outline">
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Student Chats</SidebarGroupLabel>
            <SidebarGroupContent className="max-h-[calc(90vh-280px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
              <SidebarMenu>
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <SidebarMenuItem key={chat.id} className="group relative bg-[hsl(var(--custom-bg))] dark:bg-inherit transition-colors">
                      <SidebarMenuButton
                        onClick={() => router.push(`/${userId}/chat/${chat.id}`)}
                        className="w-full transition-all duration-200 ease-in-out hover:bg-[#c7aef6] dark:hover:bg-muted font-sans font-semibold"
                      >
                        {/* <Info className="h-4 w-4 flex-shrink-0" /> */}
                        <span
                          title={chat.title || "Untitled Chat"}
                          className="truncate max-w-[160px] transition-all duration-200 px-2 py-1 rounded font-sans font-semibold"
                        >
                          {chat.title || "Untitled Chat"}
                        </span>
                      </SidebarMenuButton>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive focus:opacity-100 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToDelete(chat);
                          setDeleteDialogOpen(true);
                        }}
                        aria-label="Delete chat"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm px-3 py-2 text-center">No chats yet</p>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto border-t pt-2">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {/* <SidebarMenuButton onClick={() => setIsSettingsOpen(true)} /> */}
              <div className="flex flex-col items-start gap-0 px-2 py-1 w-full">
                <div className="text-sm font-medium">{userProfile.name}</div>
                <div className="text-xs text-muted-foreground">{userProfile.email}</div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} profile={userProfile} setProfile={setUserProfile} />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="text-xs">
          <DialogHeader className="text-xs">
            <DialogTitle className="text-xs">Delete Chat</DialogTitle>
          </DialogHeader>
          <p className="text-xs">Are you sure you want to delete the chat "{chatToDelete?.title || 'Untitled Chat'}"?</p>
          <DialogFooter className="text-xs">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} size="sm">Cancel</Button>
            <Button variant="destructive" onClick={() => handleDeleteChat(chatToDelete.id)} size="sm">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}