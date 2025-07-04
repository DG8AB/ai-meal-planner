import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIG & EARLY VALIDATION
   ─────────────────────────────────────────────────────────────────────────── */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface a clear error immediately – this is the real reason “fetch” fails.
  throw new Error(
    "Supabase environment variables are missing. " +
      "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project.",
  )
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export const getCurrentMealPlan = async (userId = "anonymous") => {
  try {
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("current", true)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Error fetching current meal plan:", err)
    throw err
  }
}

export const getMealPlanHistory = async (userId = "anonymous") => {
  try {
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (err) {
    console.error("Error fetching meal plan history:", err)
    throw err
  }
}

export const saveMealPlan = async (mealPlan: any, userId = "anonymous") => {
  try {
    // First, mark all existing plans as not current
    await supabase.from("meal_plans").update({ current: false }).eq("user_id", userId)

    // Then insert the new plan as current
    const { data, error } = await supabase
      .from("meal_plans")
      .insert([
        {
          user_id: userId,
          meal_plan: mealPlan,
          current: true,
          week_of: mealPlan.weekOf,
          meal_times: mealPlan.mealTimes,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      throw error
    }

    console.log("Meal plan saved successfully to Supabase")
    return { data, error: null }
  } catch (err) {
    console.error("Error saving meal plan:", err)
    return { error: err }
  }
}

export const deleteMealPlan = async (id: string) => {
  try {
    const { data, error } = await supabase.from("meal_plans").delete().eq("id", id)

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Error deleting meal plan:", err)
    throw err
  }
}

export const savePreferences = async (preferences: any, userId = "anonymous") => {
  try {
    const { data, error } = await supabase
      .from("preferences")
      .upsert(
        {
          user_id: userId,
          preferences: preferences,
        },
        { onConflict: "user_id" },
      )
      .select()

    if (error) {
      throw error
    }

    console.log("Preferences saved successfully to Supabase")
    return { data, error: null }
  } catch (err) {
    console.error("Error saving preferences:", err)
    return { error: err }
  }
}

// Return `null` gracefully when there’s a network problem so the UI keeps working
export const getPreferences = async (userId = "anonymous") => {
  try {
    const { data, error } = await supabase.from("preferences").select("*").eq("user_id", userId).maybeSingle()

    if (error) {
      // PostgREST code 116 = "row not found" – benign; any other error is logged
      if (error.code !== "PGRST116") console.warn("Supabase error in getPreferences:", error)
      return null
    }

    return data?.preferences ?? null
  } catch (err) {
    console.warn("Network/Fetch error in getPreferences – continuing in degraded mode:", err)
    return null
  }
}
