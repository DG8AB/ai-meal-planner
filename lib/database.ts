import type { MealPlan, DietaryPreferences } from "@/types/meal-planning"

export async function initDatabase() {
  try {
    console.log("🔄 Initializing EdgeDB...")
    const response = await fetch("/api/init-db")
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
    console.log("✅ EdgeDB connection established")
  } catch (error) {
    console.error("❌ Error connecting to EdgeDB:", error)
    throw error
  }
}

export const getCurrentMealPlan = async (userId = "anonymous") => {
  try {
    console.log("🔄 Fetching current meal plan...")
    const response = await fetch(`/api/database?action=getCurrentMealPlan&userId=${userId}`)
    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to fetch current meal plan:", error)
      return null
    }
    const data = await response.json()
    console.log("✅ Current meal plan fetched:", data ? "found" : "none")
    return data
  } catch (err) {
    console.error("❌ Error fetching current meal plan:", err)
    return null
  }
}

export const getMealPlanHistory = async (userId = "anonymous") => {
  try {
    console.log("🔄 Fetching meal plan history...")
    const response = await fetch(`/api/database?action=getMealPlanHistory&userId=${userId}`)
    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to fetch meal plan history:", error)
      return []
    }
    const data = await response.json()
    console.log(`✅ Meal plan history fetched: ${data.length} plans`)
    return data
  } catch (err) {
    console.error("❌ Error fetching meal plan history:", err)
    return []
  }
}

export const saveMealPlan = async (mealPlan: MealPlan, userId = "anonymous") => {
  try {
    console.log("🔄 Saving meal plan to EdgeDB...")
    const response = await fetch(`/api/database?action=saveMealPlan&userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mealPlan }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to save meal plan:", error)
      throw new Error(`Failed to save meal plan: ${error}`)
    }

    const result = await response.json()
    console.log("✅ Meal plan saved successfully to EdgeDB")
    return result
  } catch (err) {
    console.error("❌ Error saving meal plan:", err)
    return { error: err }
  }
}

export const deleteMealPlan = async (id: string) => {
  try {
    console.log(`🔄 Deleting meal plan ${id}...`)
    const response = await fetch(`/api/database?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to delete meal plan:", error)
      return null
    }

    const result = await response.json()
    console.log("✅ Meal plan deleted successfully")
    return result
  } catch (err) {
    console.error("❌ Error deleting meal plan:", err)
    return null
  }
}

export const savePreferences = async (preferences: DietaryPreferences, userId = "anonymous") => {
  try {
    console.log("🔄 Saving preferences to EdgeDB...")
    const response = await fetch(`/api/database?action=savePreferences&userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferences }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to save preferences:", error)
      throw new Error(`Failed to save preferences: ${error}`)
    }

    const result = await response.json()
    console.log("✅ Preferences saved successfully to EdgeDB")
    return result
  } catch (err) {
    console.error("❌ Error saving preferences:", err)
    return { error: err }
  }
}

export const getPreferences = async (userId = "anonymous") => {
  try {
    console.log("🔄 Fetching preferences...")
    const response = await fetch(`/api/database?action=getPreferences&userId=${userId}`)
    if (!response.ok) {
      const error = await response.text()
      console.log("ℹ️ No preferences found (this is normal for new users)")
      return null
    }
    const data = await response.json()
    console.log("✅ Preferences fetched:", data ? "found" : "none")
    return data
  } catch (err) {
    console.error("❌ Error fetching preferences:", err)
    return null
  }
}
