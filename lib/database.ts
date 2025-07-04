import { sql } from "@vercel/postgres"
import type { MealPlan, DietaryPreferences } from "@/types/meal-planning"

// Initialize DB tables the first time the app runs
export async function initDatabase() {
  try {
    // Pets-style examples from Vercel docs do NOT append a trailing ";".
    // Using the same pattern prevents the JSON-parse failure you saw.
    await sql`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'anonymous',
        meal_plan JSONB NOT NULL,
        current BOOLEAN DEFAULT false,
        week_of TIMESTAMPTZ NOT NULL,
        meal_times JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS preferences (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE DEFAULT 'anonymous',
        preferences JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    console.log("✅  Vercel Postgres tables are ready")
  } catch (error) {
    // Log once but never crash the UI
    console.error("Error initializing database:", error)
  }
}

export const getCurrentMealPlan = async (userId = "anonymous") => {
  try {
    const result = await sql`
      SELECT * FROM meal_plans 
      WHERE user_id = ${userId} AND current = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    return result.rows[0] || null
  } catch (err) {
    console.error("Error fetching current meal plan:", err)
    return null
  }
}

export const getMealPlanHistory = async (userId = "anonymous") => {
  try {
    const result = await sql`
      SELECT * FROM meal_plans 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `

    return result.rows || []
  } catch (err) {
    console.error("Error fetching meal plan history:", err)
    return []
  }
}

export const saveMealPlan = async (mealPlan: MealPlan, userId = "anonymous") => {
  try {
    // First, mark all existing plans as not current
    await sql`
      UPDATE meal_plans 
      SET current = false 
      WHERE user_id = ${userId}
    `

    // Then insert the new plan as current
    const result = await sql`
      INSERT INTO meal_plans (user_id, meal_plan, current, week_of, meal_times, created_at)
      VALUES (${userId}, ${JSON.stringify(mealPlan)}, true, ${mealPlan.weekOf}, ${JSON.stringify(
        mealPlan.mealTimes,
      )}, NOW())
      RETURNING *
    `

    console.log("Meal plan saved successfully to Vercel Postgres")
    return { data: result.rows[0], error: null }
  } catch (err) {
    console.error("Error saving meal plan:", err)
    return { error: err }
  }
}

export const deleteMealPlan = async (id: string) => {
  try {
    const result = await sql`
      DELETE FROM meal_plans 
      WHERE id = ${id}
      RETURNING *
    `

    return result.rows[0] || null
  } catch (err) {
    console.error("Error deleting meal plan:", err)
    return null
  }
}

export const savePreferences = async (preferences: DietaryPreferences, userId = "anonymous") => {
  try {
    const result = await sql`
      INSERT INTO preferences (user_id, preferences, updated_at)
      VALUES (${userId}, ${JSON.stringify(preferences)}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        preferences = ${JSON.stringify(preferences)},
        updated_at = NOW()
      RETURNING *
    `

    console.log("Preferences saved successfully to Vercel Postgres")
    return { data: result.rows[0], error: null }
  } catch (err) {
    console.error("Error saving preferences:", err)
    return { error: err }
  }
}

export const getPreferences = async (userId = "anonymous") => {
  try {
    const result = await sql`
      SELECT preferences FROM preferences 
      WHERE user_id = ${userId}
      LIMIT 1
    `

    return result.rows[0]?.preferences || null
  } catch (err) {
    console.error("Error fetching preferences:", err)
    return null
  }
}
