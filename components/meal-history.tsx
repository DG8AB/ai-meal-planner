"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Calendar, RotateCcw, Trash2, Loader2, Clock } from "lucide-react"
import type { MealPlan } from "@/types/meal-planning"
import { getMealPlanHistory, deleteMealPlan } from "@/lib/database"
import { isCurrentWeek, getDaysUntilExpiry, formatDateRange } from "@/lib/date-utils"

interface MealHistoryProps {
  onMealPlanRestore: (mealPlan: MealPlan) => void
}

export default function MealHistory({ onMealPlanRestore }: MealHistoryProps) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true)
      try {
        const historyData = await getMealPlanHistory()
        console.log("Loaded history data:", historyData)
        setHistory(historyData)
      } catch (error) {
        console.error("Error loading meal plan history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  const reuseMealPlan = async (historyItem: any) => {
    const mealPlan = historyItem.meal_plan
    const newMealPlan = {
      ...mealPlan,
      weekOf: new Date().toISOString(),
      id: Date.now().toString(),
    }

    try {
      console.log("Reusing meal plan:", newMealPlan)
      await onMealPlanRestore(newMealPlan)
    } catch (error) {
      console.error("Error reusing meal plan:", error)
    }
  }

  const handleDeleteMealPlan = async (id: string, index: number) => {
    try {
      await deleteMealPlan(id.toString())
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
      await Promise.all(history.map((plan) => deleteMealPlan(plan.id.toString())))
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
        {history.map((historyItem, index) => {
          const mealPlan = historyItem.meal_plan
          const weekStart = new Date(mealPlan.weekOf)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)

          const isCurrent = isCurrentWeek(mealPlan.weekOf)
          const daysLeft = getDaysUntilExpiry(mealPlan.weekOf)
          const dateRange = formatDateRange(weekStart, weekEnd)

          return (
            <Card key={index} className={isCurrent ? "ring-2 ring-orange-500" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dateRange}
                      {isCurrent && <Badge variant="default">Current Week</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Created on {new Date(historyItem.created_at).toLocaleDateString()}
                      {isCurrent && daysLeft > 0 && (
                        <>
                          <Clock className="h-4 w-4 ml-2" />
                          {daysLeft} days left
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => reuseMealPlan(historyItem)} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {isCurrent ? "View Plan" : "Reuse Plan"}
                    </Button>
                    <Button onClick={() => handleDeleteMealPlan(historyItem.id, index)} variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(mealPlan.meals)
                    .slice(0, 3)
                    .map(([day, dayMeals]: [string, any]) => (
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
          )
        })}
      </div>
    </div>
  )
}
