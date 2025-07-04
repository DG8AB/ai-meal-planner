"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChefHat, Coffee, Sun, Moon, CheckCircle, Loader2, Sparkles, Youtube, ExternalLink } from "lucide-react"
import type { DietaryPreferences, MealPlan } from "@/types/meal-planning"
import { generateMealPlan } from "@/lib/ai-service"
import { getWeekDaysFromToday } from "@/lib/date-utils"

interface MealGenerationProgressProps {
  preferences: DietaryPreferences
  availableIngredients: string[]
  specialRequests: string
  onComplete: (mealPlan: MealPlan) => void
  onError: () => void
}

interface GenerationStep {
  id: string
  day: string
  mealType: "breakfast" | "lunch" | "dinner"
  status: "pending" | "generating" | "complete"
  mealName?: string
}

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
}

const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
}

export default function MealGenerationProgress({
  preferences,
  availableIngredients,
  specialRequests,
  onComplete,
  onError,
}: MealGenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<GenerationStep[]>([])
  const [typewriterText, setTypewriterText] = useState("")
  const [showYouTube, setShowYouTube] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const fullText = "Created by Dhruv Gowda"

  // Initialize steps
  useEffect(() => {
    const weekDays = getWeekDaysFromToday()
    const mealTypes: ("breakfast" | "lunch" | "dinner")[] = ["breakfast", "lunch", "dinner"]

    const generationSteps: GenerationStep[] = []
    weekDays.forEach((day) => {
      mealTypes.forEach((mealType) => {
        generationSteps.push({
          id: `${day}-${mealType}`,
          day,
          mealType,
          status: "pending",
        })
      })
    })

    setSteps(generationSteps)
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (typewriterText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypewriterText(fullText.slice(0, typewriterText.length + 1))
      }, 100)
      return () => clearTimeout(timeout)
    } else {
      // Show YouTube link after typewriter completes
      setTimeout(() => setShowYouTube(true), 500)
    }
  }, [typewriterText, fullText])

  // Track whether we've already kicked off the long-running generation
  const [generationStarted, setGenerationStarted] = useState(false)

  // Start generation process exactly once
  useEffect(() => {
    if (!generationStarted && steps.length > 0) {
      setGenerationStarted(true) // flag so we never start again
      startGeneration()
    }
  }, [generationStarted, steps])

  const startGeneration = async () => {
    try {
      // Simulate step-by-step generation
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)

        // Update current step to generating
        setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, status: "generating" } : step)))

        // Simulate generation time (shorter for demo)
        await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))

        // Update progress
        const newProgress = ((i + 1) / steps.length) * 100
        setProgress(newProgress)

        // Mark as complete with a meal name
        const step = steps[i]
        const mealName = generateMockMealName(step.day, step.mealType, preferences)

        setSteps((prev) => prev.map((s, index) => (index === i ? { ...s, status: "complete", mealName } : s)))
      }

      // Generate the actual meal plan
      console.log("Generating actual meal plan...")
      const mealPlan = await generateMealPlan({
        preferences,
        availableIngredients,
        specialRequests,
      })

      setIsComplete(true)

      // Wait a moment before completing
      setTimeout(() => {
        onComplete(mealPlan)
      }, 1000)
    } catch (error) {
      console.error("Error in generation:", error)
      onError()
    }
  }

  const generateMockMealName = (day: string, mealType: string, prefs: DietaryPreferences): string => {
    const breakfastOptions = [
      "Greek Yogurt Parfait",
      "Avocado Toast",
      "Overnight Oats",
      "Smoothie Bowl",
      "Scrambled Eggs",
      "Chia Pudding",
      "Pancakes",
      "French Toast",
    ]

    const lunchOptions = [
      "Mediterranean Bowl",
      "Caesar Salad",
      "Quinoa Salad",
      "Soup & Sandwich",
      "Buddha Bowl",
      "Wrap",
      "Stir Fry",
      "Pasta Salad",
    ]

    const dinnerOptions = [
      "Grilled Salmon",
      "Chicken Stir Fry",
      "Vegetable Curry",
      "Pasta Primavera",
      "Beef Tacos",
      "Stuffed Peppers",
      "Rice Bowl",
      "Roasted Vegetables",
    ]

    let options = breakfastOptions
    if (mealType === "lunch") options = lunchOptions
    if (mealType === "dinner") options = dinnerOptions

    // Filter based on diet type
    if (prefs.dietType === "vegetarian" || prefs.dietType === "vegan") {
      options = options.filter(
        (meal) =>
          !meal.toLowerCase().includes("chicken") &&
          !meal.toLowerCase().includes("beef") &&
          !meal.toLowerCase().includes("salmon"),
      )
    }

    return options[Math.floor(Math.random() * options.length)]
  }

  const openYouTube = () => {
    window.open("https://www.youtube.com/@dhruvex-coding", "_blank")
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Progress Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <ChefHat className="h-6 w-6 text-orange-600" />
            {isComplete ? "Meal Plan Complete!" : "Generating Your Meal Plan"}
            {isComplete && <Sparkles className="h-6 w-6 text-orange-600" />}
          </CardTitle>
          <div className="space-y-4 mt-4">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(progress)}% Complete</span>
              <span>
                {currentStep + 1} of {steps.length} meals
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Generation Status */}
      {!isComplete && currentStep < steps.length && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-lg">
              <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
              <span>
                Generating {MEAL_LABELS[steps[currentStep]?.mealType]} for {steps[currentStep]?.day}...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const Icon = MEAL_ICONS[step.mealType]
          return (
            <Card
              key={step.id}
              className={`transition-all duration-300 ${
                step.status === "complete"
                  ? "bg-green-50 border-green-200"
                  : step.status === "generating"
                    ? "bg-orange-50 border-orange-200 scale-105"
                    : "bg-gray-50 border-gray-200"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      step.status === "complete"
                        ? "bg-green-100"
                        : step.status === "generating"
                          ? "bg-orange-100"
                          : "bg-gray-100"
                    }`}
                  >
                    {step.status === "complete" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : step.status === "generating" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                    ) : (
                      <Icon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {step.day}
                      </Badge>
                      <span className="text-sm font-medium capitalize">{step.mealType}</span>
                    </div>
                    {step.mealName && <p className="text-sm text-gray-600 mt-1">{step.mealName}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Creator Credit with Typewriter Effect */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6 text-center">
          <div className="space-y-4">
            <div className="text-lg font-mono">
              <span className="text-purple-700">{typewriterText}</span>
              <span className="animate-pulse">|</span>
            </div>

            {showYouTube && (
              <div className="animate-fade-in">
                <Button
                  onClick={openYouTube}
                  variant="outline"
                  className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Visit dhruvex-coding
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isComplete && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-green-700 text-lg font-semibold">
              <CheckCircle className="h-6 w-6" />
              Your personalized meal plan is ready!
            </div>
            <p className="text-green-600 mt-2">Redirecting you to your new meal plan...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
