"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Send, Sparkles, Moon, Sun, MessageCircle } from "lucide-react"
import { SuggestedQuestions } from "@/components/suggested-questions"
import { ChatMessage } from "@/components/chat-message"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import UserGreetText from "@/components/ui/userGreetText"
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams, useRouter } from "next/navigation"

export default function ChatPage() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [chatId, setChatId] = useState<string>("");
  const [messages, setMessages] = useState<{ id: string, role: "user" | "assistant" | "system" | "data", content: string, created_at?: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  // Fetch user profile by id from URL
  useEffect(() => {
    async function fetchUserProfile() {
      if (!id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setUserProfile(data);
    }
    fetchUserProfile();
  }, [id]);

  const createNewChat = async (firstMessage: string) => {
    const newChatId = uuidv4();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    // Create a new chat in your backend
    const response = await fetch('https://chatbot-b45.onrender.com/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: newChatId,
        title: firstMessage.substring(0, 30), // Use first message as title
        userId: userId
      }),
    });

    if (response.ok) {
      window.dispatchEvent(new Event('newChatCreated'));
      router.push(`/${userId}/chat/${newChatId}`);
    } else {
      toast({
        title: "Error",
        description: "Failed to start a new chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  // On new chat
  const startNewChat = async () => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;
    const response = await fetch('https://chatbot-b45.onrender.com/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: newChatId,
        title: 'New Chat',
        userId: userId
      }),
    });
    if (response.ok) {
      window.dispatchEvent(new Event('newChatCreated'));
      // Navigate to the new chat page
      router.push(`/${userId}/chat/${newChatId}`);
    }
  };

  // On page load, fetch messages for chatId
  useEffect(() => {
    const fetchMessages = async () => {
      localStorage.setItem('chat_id', chatId)
      try {
        const response = await fetch(`https://chatbot-b45.onrender.com/api/messages?chat_id=${chatId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }
    
    if (chatId) {
      fetchMessages()
    }
  }, [chatId])

  useEffect(() => {
    // We don't want to create a chat on load anymore,
    // so we clear any stray chat_id from local storage.
    localStorage.removeItem('chat_id');
    setChatId(""); 
    setMessages([]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const messageContent = input.trim();
    if (!messageContent) return

    // If there is no chatId, create a new chat first
    if (!chatId) {
      await createNewChat(messageContent);
      return; 
    }

    setIsLoading(true)
    const userMsg = { id: Date.now().toString(), role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMsg])

    // Store user message
    const { data, error } = await supabase.from("messages").insert([
      { 
        chat_id: chatId, 
        sender: 'user', 
        content: input,
        created_at: new Date().toISOString()
      }
    ]).select();

    try {
      const res = await fetch("https://chatbot-b45.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: input }
          ]
        }),
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      let botMessage = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        botMessage += new TextDecoder().decode(value)
      }

      const botMsg = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: botMessage }
      setMessages((prev) => [
        ...prev,
        botMsg
      ])
      setInput("")

      // Store bot message
      await fetch('https://chatbot-b45.onrender.com/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, sender: 'bot', content: botMessage }),
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    const syntheticEvent = {
      preventDefault: () => { },
      target: { elements: { message: { value: question } } },
    } as any

    handleSubmit(syntheticEvent)
  }

  useEffect(() => {
    const fetchAndEnsureChat = async () => {
      // This logic is now simplified to only fetch existing chats
      // and not create one automatically on load.
      const response = await fetch(`https://chatbot-b45.onrender.com/api/chats?user_id=${id}`);
      const data = await response.json();
      if (data.chats && data.chats.length > 0) {
        // If there are chats, you might want to load the most recent one
        // For now, it does nothing to prevent loading a chat automatically.
      } else {
        setChatId("");
        setMessages([]);
      }
    };
  
    if (id) {
      fetchAndEnsureChat();
    }
  }, [id]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* User Profile Section */}
      {/* {userProfile && (
        <div className="flex items-center gap-4 p-4 border-b bg-background/80">
          {userProfile.avatar_url && (
            <img src={userProfile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <div className="font-bold text-lg">{userProfile.name}</div>
            <div className="text-muted-foreground text-sm">{userProfile.email}</div>
          </div>
        </div>
      )} */}

      {/* Header */}
      <div className="flex items-center justify-between py-4 sm:py-6 px-4 sm:px-8 border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger onClick={() => setSidebarOpen((prev) => !prev)} />
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Student-Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          <UserGreetText />
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={startNewChat} className="font-sans font-semibold">
              New Chat
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 chat-scroll-area font-sans font-semibold">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
              <div className="text-center space-y-1 md:space-y-2">
                <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto" />
                <h2 className="text-sm md:text-2xl font-bold">Welcome to StudentBot</h2>
                <p className="text-[13px] md:text-base text-muted-foreground max-w-xs md:max-w-md mx-auto">
                  Your AI companion for health and career guidance. Ask me anything about wellness, career paths, study tips, or personal development.
                </p>
              </div>
              <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} />
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} className="text-xs sm:text-sm" />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[80%]">  
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-primary animate-pulse" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">StudentBot is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-2 sm:p-4 border-t border border-gray-600 dark:border-muted bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-full sm:max-w-4xl mx-auto items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about health, career, or study guidance..."
              className="flex-1 placeholder:text-muted-foreground placeholder:text-[10px] md:placeholder:text-[15px] min-w-0"
            />
            <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-8 w-8 p-0 md:h-11 md:w-11">
              <Send className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            StudentBot can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
