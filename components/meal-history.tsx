"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Calendar, RotateCcw, Trash2, Loader2 } from "lucide-react"
import type { MealPlan } from "@/types/meal-planning"
import { getMealPlanHistory, deleteMealPlan, saveMealPlan } from "@/lib/supabase"

export default function MealHistory() {
  const [history, setHistory] = useState<(MealPlan & { createdAt: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true)
      try {
        const historyData = await getMealPlanHistory()
        setHistory(historyData)
      } catch (error) {
        console.error("Error loading meal plan history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  const reuseMealPlan = async (mealPlan: MealPlan) => {
    const newMealPlan = {
      ...mealPlan,
      weekOf: new Date().toISOString(),
      id: Date.now().toString(),
    }

    try {
      await saveMealPlan(newMealPlan)
      // Redirect to current plan tab
      window.location.href = "/?tab=current"
    } catch (error) {
      console.error("Error reusing meal plan:", error)
      window.location.reload()
    }
  }

  const handleDeleteMealPlan = async (id: string, index: number) => {
    try {
      await deleteMealPlan(id)
      // Update local state
      const newHistory = history.filter((_, i) => i !== index)
      setHistory(newHistory)
    } catch (error) {
      console.error("Error deleting meal plan:", error)
    }
  }

  const clearHistory = async () => {
    try {
      // Delete all meal plans in history
      await Promise.all(history.map((plan) => deleteMealPlan(plan.id)))
      setHistory([])
    } catch (error) {
      console.error("Error clearing history:", error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading History...</h3>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Meal Plan History</h3>
          <p className="text-gray-500">Your generated meal plans will appear here for easy reference!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Meal Plan History
              </CardTitle>
              <CardDescription>Your previously generated meal plans</CardDescription>
            </div>
            <Button onClick={clearHistory} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {history.map((mealPlan, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Week of {new Date(mealPlan.weekOf).toLocaleDateString()}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Created on {new Date(mealPlan.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => reuseMealPlan(mealPlan)} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reuse Plan
                  </Button>
                  <Button onClick={() => handleDeleteMealPlan(mealPlan.id, index)} variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(mealPlan.meals)
                  .slice(0, 3)
                  .map(([day, dayMeals]) => (
                    <div key={day} className="flex gap-4 text-sm">
                      <Badge variant="outline" className="min-w-[80px]">
                        {day}
                      </Badge>
                      <div className="flex-1">
                        <span className="font-medium">{dayMeals.breakfast.name}</span>
                        <span className="text-gray-500"> • </span>
                        <span className="font-medium">{dayMeals.lunch.name}</span>
                        <span className="text-gray-500"> • </span>
                        <span className="font-medium">{dayMeals.dinner.name}</span>
                      </div>
                    </div>
                  ))}
                {Object.keys(mealPlan.meals).length > 3 && (
                  <p className="text-sm text-gray-500">+{Object.keys(mealPlan.meals).length - 3} more days...</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
