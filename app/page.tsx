"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ChefHat, ShoppingCart, Settings, History, Plus, Loader2, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MealPlanGenerator from "@/components/meal-plan-generator"
import MealPlanView from "@/components/meal-plan-view"
import ShoppingList from "@/components/shopping-list"
import MealHistory from "@/components/meal-history"
import PreferencesSettings from "@/components/preferences-settings"
import type { MealPlan, DietaryPreferences } from "@/types/meal-planning"
import { getCurrentMealPlan, getPreferences, saveMealPlan, savePreferences } from "@/lib/database"

export default function MealPlanningAssistant() {
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null)
  const [preferences, setPreferences] = useState<DietaryPreferences>({
    dietType: "balanced",
    allergies: [],
    dislikes: [],
    servingSize: 4,
    budgetRange: "medium",
  })
  const [activeTab, setActiveTab] = useState("planner")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get URL params to handle tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get("tab")
    if (tab && ["planner", "current", "shopping", "history", "settings"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("tab", value)
    window.history.replaceState(null, "", newUrl.toString())
  }

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // Initialize database first
        await fetch("/api/init-db")

        // Load preferences from database
        const savedPreferences = await getPreferences()
        if (savedPreferences) {
          setPreferences(savedPreferences)
        }

        // Load current meal plan from database
        const savedMealPlan = await getCurrentMealPlan()
        if (savedMealPlan) {
          // Convert database format to app format if needed
          const mealPlan = savedMealPlan.meal_plan || savedMealPlan
          setCurrentMealPlan(mealPlan)
        }
      } catch (error) {
        console.error("Error loading data from database:", error)
        setError("Unable to connect to the database. Please check your internet connection and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleMealPlanGenerated = async (mealPlan: MealPlan) => {
    try {
      console.log("Saving new meal plan:", mealPlan)
      setCurrentMealPlan(mealPlan)

      // Save to database
      const result = await saveMealPlan(mealPlan)
      if (result.error) {
        console.error("Error saving to database:", result.error)
        setError("Failed to save meal plan to database. Your meal plan is still available in this session.")
      } else {
        console.log("Meal plan saved successfully to database")
        setError(null)
      }

      // Auto-switch to current plan tab
      handleTabChange("current")
    } catch (error) {
      console.error("Error saving meal plan:", error)
      setError("Failed to save meal plan. Your meal plan is still available in this session.")
    }
  }

  const handlePreferencesUpdate = async (newPreferences: DietaryPreferences) => {
    try {
      console.log("Saving preferences:", newPreferences)
      setPreferences(newPreferences)

      const result = await savePreferences(newPreferences)
      if (result.error) {
        console.error("Error saving preferences:", result.error)
        setError("Failed to save preferences to database.")
      } else {
        console.log("Preferences saved successfully")
        setError(null)
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      setError("Failed to save preferences.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading your meal plans...</p>
          <p className="text-sm text-gray-500 mt-2">Created by dg8ab</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Meal Planner</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your intelligent family meal planning assistant. Get personalized meal suggestions, organized weekly plans,
            and automated shopping lists.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <User className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-500">Created by dg8ab</p>
          </div>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-white rounded-lg shadow-sm mb-6 p-1">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="truncate">Plan Meals</span>
              </TabsTrigger>
              <TabsTrigger value="current" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="truncate">Current Plan</span>
              </TabsTrigger>
              <TabsTrigger value="shopping" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="truncate">Shopping List</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="truncate">History</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="truncate">Preferences</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="planner">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Meal Plan</CardTitle>
                <CardDescription>
                  Create a personalized 7-day meal plan starting from today and going to the same day next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MealPlanGenerator preferences={preferences} onMealPlanGenerated={handleMealPlanGenerated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current">
            {currentMealPlan ? (
              <MealPlanView mealPlan={currentMealPlan} onMealPlanUpdate={handleMealPlanGenerated} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Meal Plan Yet</h3>
                  <p className="text-gray-500 mb-4">Generate your first meal plan to get started!</p>
                  <Button onClick={() => handleTabChange("planner")}>Create Meal Plan</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingList mealPlan={currentMealPlan} />
          </TabsContent>

          <TabsContent value="history">
            <MealHistory onMealPlanRestore={handleMealPlanGenerated} />
          </TabsContent>

          <TabsContent value="settings">
            <PreferencesSettings preferences={preferences} onPreferencesUpdate={handlePreferencesUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
