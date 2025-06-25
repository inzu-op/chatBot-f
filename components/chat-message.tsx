"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MessageCircle, Copy } from "lucide-react"
import type { Message } from "ai"

interface ChatMessageProps {
  message: Message
  timestamp?: string
  isTyping?: boolean // for bot typing animation
  className?: string
}

export function ChatMessage({ message, timestamp, isTyping, className }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [displayed, setDisplayed] = useState(isTyping ? "" : message.content)
  const typingInterval = useRef<NodeJS.Timeout | null>(null)

  // Typing effect for bot
  useEffect(() => {
    if (isTyping && !isUser) {
      let i = 0
      typingInterval.current = setInterval(() => {
        setDisplayed(message.content.slice(0, i + 1))
        i++
        if (i >= message.content.length) {
          if (typingInterval.current) clearInterval(typingInterval.current)
        }
      }, 12)
      return () => {
        if (typingInterval.current) clearInterval(typingInterval.current)
      }
    } else {
      setDisplayed(message.content)
    }
  }, [isTyping, message.content, isUser])

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  // Format timestamp
  const formatTime = (ts?: string) => {
    if (!ts) return ""
    const date = new Date(ts)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Clean and enhance content
  const cleanContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[(.*?)\]$$.*?$$/g, "$1")
      .replace(/^\s*[-*+]\s/gm, "• ")
      .replace(/^\s*\d+\.\s/gm, "")
      .trim()
  }

  // Render content with clickable links
  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 break-all text-[13px]"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 items-end ${isUser ? "justify-end" : "justify-start"} animate-fade-in ${className || ''}`}>  
      {!isUser && (
        <Avatar className={`h-8 w-8 mt-1 ${isTyping ? "animate-bounce" : ""}`}>
          <AvatarFallback className="bg-primary text-primary-foreground">
            <MessageCircle className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card
        className={`group relative max-w-[70%]  shadow-sm border-none transition-all duration-300 ${
          isUser
            ? "bg-[hsl(var(--custom-bg))]  dark:bg-primary text-black dark:text-primary-foreground rounded-tr-2xl rounded-tl-2xl rounded-bl-lg"
            : "bg-[hsl(var(--custom-bg))] dark:bg-muted text-foreground rounded-tl-2xl rounded-tr-2xl rounded-br-lg"
        }`}
      >
        <CardContent className="p-3 md:p-4 relative">
          <div
            className={`whitespace-pre-wrap leading-relaxed text-xs sm:text-sm ${!isUser ? "prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3" : ""}`}
          >
            {renderContentWithLinks(cleanContent(displayed))}
          </div>
          {/* Copy button for bot */}
          {!isUser && !isTyping && (
            <button
              className="absolute top-2 right-2 p-1 rounded-full bg-background/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent hover:text-accent-foreground"
              title={copied ? "Copied!" : "Copy"}
              onClick={handleCopy}
            >
              <Copy className={`h-4 w-4 transition-colors ${copied ? "text-green-500" : ""}`} />
            </button>
          )}
        </CardContent>
        {/* Timestamp - hidden by default, shown on hover */}
        {timestamp && (
           <div
           className={`text-xs px-3 pb-2 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 ${
             isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left"
           }`}
         >
           {formatTime(timestamp)}
         </div>
        )}
      </Card>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
