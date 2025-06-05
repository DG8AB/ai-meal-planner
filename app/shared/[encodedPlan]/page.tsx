"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Users, ChefHat, AlertCircle, Home } from "lucide-react"
import Link from "next/link"
import type { MealPlan } from "@/types/meal-planning"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const

export default function SharedMealPlan() {
  const params = useParams()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const encodedPlan = params.encodedPlan as string
      if (!encodedPlan) {
        setError("No meal plan data provided")
        return
      }

      const decodedPlan = decodeURIComponent(escape(atob(encodedPlan)))
      const parsedPlan = JSON.parse(decodedPlan)

      // Validate the meal plan structure
      if (!parsedPlan.meals || !parsedPlan.weekOf) {
        setError("Invalid meal plan format")
        return
      }

      setMealPlan(parsedPlan)
    } catch (err) {
      console.error("Error decoding meal plan:", err)
      setError("Invalid or corrupted meal plan link")
    }
  }, [params.encodedPlan])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go to Meal Planner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading meal plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Shared Meal Plan</h1>
          </div>
          <p className="text-lg text-gray-600">Week of {new Date(mealPlan.weekOf).toLocaleDateString()}</p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Create Your Own Meal Plan
              </Button>
            </Link>
          </div>
        </header>

        <div className="space-y-6">
          {DAYS.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-xl">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MEAL_TYPES.map((mealType) => {
                    const meal = mealPlan.meals[day][mealType]
                    return (
                      <Card key={mealType} className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg capitalize">{mealType}</CardTitle>
                          <CardDescription className="font-medium">{meal.name}</CardDescription>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meal.prepTime}
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {meal.servings}
                            </Badge>
                            <Badge variant="outline">{meal.difficulty}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-medium text-sm">Ingredients:</h4>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {meal.ingredients.slice(0, 4).map((ingredient, index) => (
                                  <li key={index}>{ingredient}</li>
                                ))}
                                {meal.ingredients.length > 4 && (
                                  <li className="text-gray-500">+{meal.ingredients.length - 4} more...</li>
                                )}
                              </ul>
                            </div>
                            {meal.mealPrepTips && (
                              <div>
                                <h4 className="font-medium text-sm">Prep Tip:</h4>
                                <p className="text-sm text-gray-600">{meal.mealPrepTips}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="text-center mt-12 py-8 border-t">
          <p className="text-gray-600 mb-4">This meal plan was created with the AI Meal Planning Assistant</p>
          <Link href="/">
            <Button>
              <ChefHat className="h-4 w-4 mr-2" />
              Create Your Own Meal Plan
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  )
}
