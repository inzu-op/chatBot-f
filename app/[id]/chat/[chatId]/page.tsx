"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessage } from "@/components/chat-message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Moon, Sun, MessageCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import UserGreetText from "@/components/ui/userGreetText";
import { v4 as uuidv4 } from "uuid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ChatPage() {
  const { id, chatId } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://chatbot-b45.onrender.com/api/messages?chat_id=${chatId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else {
          setMessages([]);
        }
      } catch (error) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || input.trim().length < 2) return;
    setIsLoading(true);
    const userMsg = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);

    // If this is the first message, create the chat record and set the title
    if (messages.length === 0) {
      await fetch("https://chatbot-b45.onrender.com/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chatId, title: input.trim(), userId: id }),
      });
      window.dispatchEvent(new Event("newChatCreated"));
    }

    // Store user message in backend
    await fetch("https://chatbot-b45.onrender.com/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, sender: "user", content: input.trim() }),
    });

    try {
      const res = await fetch(`https://chatbot-b45.onrender.com/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages
              .filter(m => m.content && typeof m.content === "string" && (m.role || m.sender))
              .map(m => ({
                role: (m.role === "bot" || m.sender === "bot") ? "assistant" : (m.role || m.sender),
                content: m.content
              })),
            { role: "user", content: input.trim() }
          ]
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      let botMessage = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botMessage += new TextDecoder().decode(value);
      }

      const botMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: botMessage };
      setMessages((prev) => [...prev, botMsg]);
      setInput("");

      // Store bot message in backend
      await fetch("https://chatbot-b45.onrender.com/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, sender: "bot", content: botMessage }),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between py-4 sm:py-6 px-4 sm:px-8 border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger onClick={() => setSidebarOpen((prev) => !prev)} />
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Student-Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          <UserGreetText />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 font-sans font-semibold"
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
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center space-y-2">
                <Sparkles className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-2xl font-bold">No messages yet</h2>
                <p className="text-muted-foreground max-w-md">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    ...message,
                    role: message.role || message.sender // fallback to sender if role is missing
                  }}
                  className="text-[10px] sm:text-xs"
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[70%] shadow-md border-none bg-gray-200 text-gray-900 rounded-bl-2xl rounded-tr-2xl rounded-br-md">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-primary animate-pulse" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
              placeholder="Type your message..."
              className="flex-1 min-w-0 text-xs md:text-[15px]"
            />
            <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-8 w-8 p-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[8px]  md:text-md text-center mt-2">
            StudentBot can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}