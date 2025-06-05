"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Calendar, RotateCcw, Trash2 } from "lucide-react"
import type { MealPlan } from "@/types/meal-planning"

export default function MealHistory() {
  const [history, setHistory] = useState<(MealPlan & { createdAt: string })[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem("mealPlanHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const reuseMealPlan = (mealPlan: MealPlan) => {
    const newMealPlan = {
      ...mealPlan,
      weekOf: new Date().toISOString(),
      id: Date.now().toString(),
    }

    try {
      localStorage.setItem("currentMealPlan", JSON.stringify(newMealPlan))

      // Add to history
      const currentHistory = JSON.parse(localStorage.getItem("mealPlanHistory") || "[]")
      currentHistory.unshift({ ...newMealPlan, createdAt: new Date().toISOString() })
      localStorage.setItem("mealPlanHistory", JSON.stringify(currentHistory.slice(0, 10)))

      // Force page reload to update state
      window.location.href = "/?tab=current"
    } catch (error) {
      console.error("Error reusing meal plan:", error)
      window.location.reload()
    }
  }

  const deleteMealPlan = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index)
    setHistory(newHistory)
    localStorage.setItem("mealPlanHistory", JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("mealPlanHistory")
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
                  <Button onClick={() => deleteMealPlan(index)} variant="ghost" size="sm">
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
