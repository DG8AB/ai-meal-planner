"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, X, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import type { DietaryPreferences, MealPlan } from "@/types/meal-planning"
import { getSmartWeekRange, formatDateRange } from "@/lib/date-utils"
import MealGenerationProgress from "@/components/meal-generation-progress"

interface MealPlanGeneratorProps {
  preferences: DietaryPreferences
  onMealPlanGenerated: (mealPlan: MealPlan) => void
}

export default function MealPlanGenerator({ preferences, onMealPlanGenerated }: MealPlanGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [puterStatus, setPuterStatus] = useState<"loading" | "ready" | "error">("loading")
  const [weekRange, setWeekRange] = useState(getSmartWeekRange())

  // Update week range when component mounts
  useEffect(() => {
    setWeekRange(getSmartWeekRange())
  }, [])

  // Check Puter.js status on component mount
  useEffect(() => {
    const checkPuterStatus = () => {
      if (typeof window !== "undefined") {
        if (window.puter) {
          setPuterStatus("ready")
        } else {
          // Try to load Puter.js
          const script = document.createElement("script")
          script.src = "https://js.puter.com/v2/"
          script.async = true

          script.onload = () => {
            // Wait a bit for puter to initialize
            setTimeout(() => {
              if (window.puter) {
                setPuterStatus("ready")
              } else {
                setPuterStatus("error")
              }
            }, 1000)
          }

          script.onerror = () => {
            setPuterStatus("error")
          }

          document.head.appendChild(script)
        }
      }
    }

    checkPuterStatus()

    // Check periodically if not ready
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.puter && puterStatus !== "ready") {
        setPuterStatus("ready")
        clearInterval(interval)
      }
    }, 1000)

    // Cleanup
    return () => clearInterval(interval)
  }, [puterStatus])

  const addIngredient = () => {
    if (ingredientInput.trim() && !availableIngredients.includes(ingredientInput.trim())) {
      setAvailableIngredients([...availableIngredients, ingredientInput.trim()])
      setIngredientInput("")
    }
  }

  const removeIngredient = (ingredient: string) => {
    setAvailableIngredients(availableIngredients.filter((i) => i !== ingredient))
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
  }

  return (
    <div className="space-y-6">
      {/* Smart Date Range Display */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calendar className="h-5 w-5" />
            Smart Week Planning
          </CardTitle>
          <CardDescription className="text-orange-700">
            Your meal plan will cover <strong>{formatDateRange(weekRange.startDate, weekRange.endDate)}</strong>
            <br />
            Starting from <strong>{weekRange.startDay}</strong> (today) through next{" "}
            <strong>{weekRange.startDay}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Puter.js Status Indicator */}
      {puterStatus === "loading" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading AI capabilities...</AlertDescription>
        </Alert>
      )}

      {puterStatus === "ready" && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            AI is ready! Your meal plans will be generated using advanced AI technology.
          </AlertDescription>
        </Alert>
      )}

      {puterStatus === "error" && (
        <Alert>
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            AI is currently unavailable. Don't worry - we'll create an intelligent meal plan using our curated recipe
            database that considers your preferences and ingredients.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Ingredients</CardTitle>
            <CardDescription>
              Add ingredients you already have at home - we'll prioritize meals that use them!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., chicken breast, tomatoes, quinoa..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
              />
              <Button onClick={addIngredient} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                  {ingredient}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeIngredient(ingredient)} />
                </Badge>
              ))}
            </div>
            {availableIngredients.length === 0 && (
              <p className="text-sm text-gray-500">
                Add ingredients you have at home to get personalized meal suggestions that use what you already own!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Special Requests</CardTitle>
            <CardDescription>Any specific meals, cuisines, or cooking preferences?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., I want to try Mediterranean cuisine this week, include more one-pot meals, or focus on quick 30-minute recipes..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Preferences</CardTitle>
          <CardDescription>Your meal plan will be customized based on these preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Diet: {preferences.dietType}</Badge>
            <Badge variant="outline">Serving Size: {preferences.servingSize} people</Badge>
            <Badge variant="outline">Budget: {preferences.budgetRange}</Badge>
            {(preferences.allergies ?? []).length > 0 &&
              (preferences.allergies ?? []).map((allergy) => (
                <Badge key={allergy} variant="destructive">
                  No {allergy}
                </Badge>
              ))}
            {(preferences.dislikes ?? []).length > 0 &&
              (preferences.dislikes ?? []).map((dislike) => (
                <Badge key={dislike} variant="secondary">
                  Avoid {dislike}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        {isGenerating ? (
          <MealGenerationProgress
            preferences={preferences}
            availableIngredients={availableIngredients}
            specialRequests={specialRequests}
            onComplete={onMealPlanGenerated}
            onError={() => setIsGenerating(false)}
          />
        ) : (
          <>
            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {puterStatus === "ready" ? "Generate AI Meal Plan" : "Generate Intelligent Meal Plan"}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              {puterStatus === "ready"
                ? "Powered by AI for personalized recommendations"
                : "Using intelligent algorithms based on your preferences"}
            </p>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">Created by gen</p>
    </div>
  )
}
