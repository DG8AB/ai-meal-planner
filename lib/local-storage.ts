import type { MealPlan, DietaryPreferences } from "@/types/meal-planning"

const STORAGE_KEYS = {
  CURRENT_MEAL_PLAN: "meal_planner_current_plan",
  MEAL_PLAN_HISTORY: "meal_planner_history",
  PREFERENCES: "meal_planner_preferences",
}

export const getCurrentMealPlan = async (userId = "anonymous"): Promise<MealPlan | null> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_MEAL_PLAN)
    if (!stored) return null

    const data = JSON.parse(stored)
    console.log("✅ Current meal plan loaded from localStorage")
    return data
  } catch (error) {
    console.error("❌ Error loading current meal plan:", error)
    return null
  }
}

export const getMealPlanHistory = async (userId = "anonymous"): Promise<any[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN_HISTORY)
    if (!stored) return []

    const data = JSON.parse(stored)
    console.log(`✅ Meal plan history loaded: ${data.length} plans`)
    return data
  } catch (error) {
    console.error("❌ Error loading meal plan history:", error)
    return []
  }
}

export const saveMealPlan = async (mealPlan: MealPlan, userId = "anonymous") => {
  try {
    console.log("🔄 Saving meal plan to localStorage...")

    // Save as current plan
    localStorage.setItem(STORAGE_KEYS.CURRENT_MEAL_PLAN, JSON.stringify(mealPlan))

    // Add to history
    const history = await getMealPlanHistory()
    const historyItem = {
      id: mealPlan.id,
      meal_plan: JSON.stringify(mealPlan),
      created_at: new Date().toISOString(),
      current: true,
      week_of: mealPlan.weekOf,
      meal_times: mealPlan.mealTimes,
    }

    // Remove any existing plan with same ID and add new one at the beginning
    const filteredHistory = history.filter((item) => item.id !== mealPlan.id)
    const newHistory = [historyItem, ...filteredHistory]

    // Keep only last 10 plans
    const trimmedHistory = newHistory.slice(0, 10)
    localStorage.setItem(STORAGE_KEYS.MEAL_PLAN_HISTORY, JSON.stringify(trimmedHistory))

    console.log("✅ Meal plan saved successfully to localStorage")
    return { data: historyItem, error: null }
  } catch (error) {
    console.error("❌ Error saving meal plan:", error)
    return { error }
  }
}

export const deleteMealPlan = async (id: string) => {
  try {
    console.log(`🔄 Deleting meal plan ${id}...`)

    const history = await getMealPlanHistory()
    const filteredHistory = history.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEYS.MEAL_PLAN_HISTORY, JSON.stringify(filteredHistory))

    // If this was the current plan, clear it
    const current = await getCurrentMealPlan()
    if (current && current.id === id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL_PLAN)
    }

    console.log("✅ Meal plan deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("❌ Error deleting meal plan:", error)
    return null
  }
}

export const savePreferences = async (preferences: DietaryPreferences, userId = "anonymous") => {
  try {
    console.log("🔄 Saving preferences to localStorage...")
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
    console.log("✅ Preferences saved successfully to localStorage")
    return { data: preferences, error: null }
  } catch (error) {
    console.error("❌ Error saving preferences:", error)
    return { error }
  }
}

export const getPreferences = async (userId = "anonymous"): Promise<DietaryPreferences | null> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    if (!stored) return null

    const data = JSON.parse(stored)
    console.log("✅ Preferences loaded from localStorage")
    return data
  } catch (error) {
    console.error("❌ Error loading preferences:", error)
    return null
  }
}

// Helper function to clear all data (for testing)
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL_PLAN)
  localStorage.removeItem(STORAGE_KEYS.MEAL_PLAN_HISTORY)
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES)
  console.log("🗑️ All meal planner data cleared")
}
