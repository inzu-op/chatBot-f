"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Briefcase, BookOpen, TrendingUp } from "lucide-react"

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void
}

const suggestedQuestions = [
  {
    icon: Heart,
    question: "How can I manage stress during exam periods?",
    category: "Health & Wellness",
  },
  {
    icon: Briefcase,
    question: "How do I choose the right career path for my interests?",
    category: "Career Guidance",
  },
  {
    icon: BookOpen,
    question: "What are effective study techniques for better grades?",
    category: "Academic Success",
  },
  {
    icon: TrendingUp,
    question: "How can I build confidence and leadership skills?",
    category: "Personal Development",
  },
]

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* <h3 className="text-lg font-semibold mb-4 text-center">Get Started</h3> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2">
        {suggestedQuestions.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer max-w-full bg-[#E6D8F8] dark:bg-transparent">
            <CardContent className="p-2 sm:p-3 max-w-full">
              <Button
                variant="ghost"
                className="w-full h-auto p-0 text-left justify-start flex-col items-start gap-1 min-h-[44px] min-w-0 max-w-full"
                onClick={() => onQuestionClick(item.question)}
              >
                <div className="flex items-center gap-1 w-full min-w-0 max-w-full">
                  <item.icon className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-full">{item.category}</span>
                </div>
                <p className="text-xs md:text-md font-medium text-foreground leading-snug break-words max-w-full">
                  {item.question}
                </p>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
