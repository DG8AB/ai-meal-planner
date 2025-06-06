import { createClient } from "@supabase/supabase-js"
import type { MealPlan, DietaryPreferences } from "@/types/meal-planning"

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://your-project-url.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// User management
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Meal plan management
export async function saveMealPlan(mealPlan: MealPlan) {
  const user = await getCurrentUser()
  if (!user) return { error: new Error("User not authenticated") }

  const { data, error } = await supabase
    .from("meal_plans")
    .upsert({
      id: mealPlan.id,
      user_id: user.id,
      week_of: mealPlan.weekOf,
      meal_times: mealPlan.mealTimes,
      meals: mealPlan.meals,
      created_at: new Date().toISOString(),
    })
    .select()

  // Also save to localStorage as backup
  if (!error) {
    try {
      localStorage.setItem("currentMealPlan", JSON.stringify(mealPlan))
    } catch (e) {
      console.error("Failed to save to localStorage:", e)
    }
  }

  return { data, error }
}

export async function getCurrentMealPlan() {
  const user = await getCurrentUser()

  if (!user) {
    // Fall back to localStorage if not authenticated
    try {
      const localPlan = localStorage.getItem("currentMealPlan")
      return localPlan ? JSON.parse(localPlan) : null
    } catch (e) {
      console.error("Failed to get from localStorage:", e)
      return null
    }
  }

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    // Fall back to localStorage if DB fetch fails
    try {
      const localPlan = localStorage.getItem("currentMealPlan")
      return localPlan ? JSON.parse(localPlan) : null
    } catch (e) {
      console.error("Failed to get from localStorage:", e)
      return null
    }
  }

  return data
}

export async function getMealPlanHistory() {
  const user = await getCurrentUser()

  if (!user) {
    // Fall back to localStorage if not authenticated
    try {
      const localHistory = localStorage.getItem("mealPlanHistory")
      return localHistory ? JSON.parse(localHistory) : []
    } catch (e) {
      console.error("Failed to get from localStorage:", e)
      return []
    }
  }

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error || !data) {
    // Fall back to localStorage if DB fetch fails
    try {
      const localHistory = localStorage.getItem("mealPlanHistory")
      return localHistory ? JSON.parse(localHistory) : []
    } catch (e) {
      console.error("Failed to get from localStorage:", e)
      return []
    }
  }

  return data
}

export async function deleteMealPlan(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: new Error("User not authenticated") }

  const { data, error } = await supabase.from("meal_plans").delete().eq("id", id).eq("user_id", user.id)

  return { data, error }
}

// Preferences management
export async function savePreferences(preferences: DietaryPreferences) {
  const user = await getCurrentUser()
  if (!user) {
    // Save to localStorage if not authenticated
    try {
      localStorage.setItem("mealPlanPreferences", JSON.stringify(preferences))
      return { data: preferences, error: null }
    } catch (e) {
      console.error("Failed to save to localStorage:", e)
      return { data: null, error: e }
    }
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      diet_type: preferences.dietType,
      allergies: preferences.allergies,
      dislikes: preferences.dislikes,
      serving_size: preferences.servingSize,
      budget_range: preferences.budgetRange,
    })
    .select()

  // Also save to localStorage as backup
  if (!error) {
    try {
      localStorage.setItem("mealPlanPreferences", JSON.stringify(preferences))
    } catch (e) {
      console.error("Failed to save to localStorage:", e)
    }
  }

  return { data, error }
}

export async function getPreferences() {
  const user = await getCurrentUser()

  if (!user) {
    // Fall back to localStorage if not authenticated
    try {
      const localPrefs = localStorage.getItem("mealPlanPreferences")
      return localPrefs ? JSON.parse(localPrefs) : null
    } catch (e) {
      console.error("Failed to get from localStorage:", e)
      return null
    }
  }

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  if (error || !data) {
    // Fall back to localStorage if DB fetch fails
    try {
      const localPrefs = localStorage.getItem("mealPlanPreferences")
      return localPrefs ? JSON.parse(localPrefs) : null
    } catch (e) {
      console.error("Failed to get from localStorage:", e)
      return null
    }
  }

  // Convert from DB format to app format
  return {
    dietType: data.diet_type,
    allergies: data.allergies,
    dislikes: data.dislikes,
    servingSize: data.serving_size,
    budgetRange: data.budget_range,
  }
}
