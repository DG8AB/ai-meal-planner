import { type NextRequest, NextResponse } from "next/server"
import { client, ensureSchema } from "@/lib/edgedb-server"

// Call once per cold-start
await ensureSchema()

function bad(msg: string, code = 400) {
  console.error("API Error:", msg)
  return NextResponse.json({ error: msg }, { status: code })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action")
  const userId = searchParams.get("userId") ?? "anonymous"

  console.log(`GET ${action} for user ${userId}`)

  try {
    switch (action) {
      case "getCurrentMealPlan": {
        const data = await client.querySingle(
          `
          SELECT MealPlan {
            id, user_id, meal_plan, current, week_of, meal_times, created_at
          }
          FILTER .user_id = <str>$userId AND .current = true
          ORDER BY .created_at DESC
          LIMIT 1
        `,
          { userId },
        )
        console.log("Current meal plan:", data ? "found" : "none")
        return NextResponse.json(data)
      }

      case "getMealPlanHistory": {
        const rows = await client.query(
          `
          SELECT MealPlan {
            id, user_id, meal_plan, current, week_of, meal_times, created_at
          }
          FILTER .user_id = <str>$userId
          ORDER BY .created_at DESC
        `,
          { userId },
        )
        console.log(`History: ${rows.length} plans found`)
        return NextResponse.json(rows)
      }

      case "getPreferences": {
        const pref = await client.querySingle(
          `
          SELECT Preferences { preferences }
          FILTER .user_id = <str>$userId
        `,
          { userId },
        )
        console.log("Preferences:", pref ? "found" : "none")
        return NextResponse.json(pref?.preferences ?? null)
      }

      default:
        return bad("Invalid action")
    }
  } catch (err) {
    console.error("Database GET error:", err)
    return bad(`Database operation failed: ${err}`, 500)
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action")
  const userId = searchParams.get("userId") ?? "anonymous"
  const body = await req.json()

  console.log(`POST ${action} for user ${userId}`)

  try {
    switch (action) {
      case "saveMealPlan": {
        const { mealPlan } = body
        console.log("Saving meal plan:", mealPlan.id)

        // First, mark all existing plans as not current
        await client.execute(
          `
          UPDATE MealPlan
          FILTER .user_id = <str>$userId
          SET { current := false }
        `,
          { userId },
        )

        // Then insert the new plan
        const row = await client.querySingle(
          `
          INSERT MealPlan {
            user_id := <str>$userId,
            meal_plan := <json>$plan,
            current := true,
            week_of := <datetime>$weekOf,
            meal_times := <json>$mealTimes
          }
        `,
          {
            userId,
            plan: mealPlan,
            weekOf: mealPlan.weekOf,
            mealTimes: mealPlan.mealTimes,
          },
        )

        console.log("✅ Meal plan saved successfully")
        return NextResponse.json({ data: row, error: null })
      }

      case "savePreferences": {
        const { preferences } = body
        console.log("Saving preferences:", Object.keys(preferences))

        // Check if preferences exist
        const existing = await client.querySingle(`SELECT Preferences { id } FILTER .user_id = <str>$userId`, {
          userId,
        })

        let row
        if (existing) {
          // Update existing
          row = await client.querySingle(
            `
            UPDATE Preferences
            FILTER .user_id = <str>$userId
            SET {
              preferences := <json>$pref,
              updated_at := datetime_current()
            }
          `,
            { userId, pref: preferences },
          )
        } else {
          // Insert new
          row = await client.querySingle(
            `
            INSERT Preferences {
              user_id := <str>$userId,
              preferences := <json>$pref
            }
          `,
            { userId, pref: preferences },
          )
        }

        console.log("✅ Preferences saved successfully")
        return NextResponse.json({ data: row, error: null })
      }

      default:
        return bad("Invalid action")
    }
  } catch (err) {
    console.error("Database POST error:", err)
    return bad(`Database operation failed: ${err}`, 500)
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return bad("id required")

  console.log(`DELETE meal plan ${id}`)

  try {
    const row = await client.querySingle(`DELETE MealPlan FILTER .id = <uuid>$id`, { id })
    console.log("✅ Meal plan deleted")
    return NextResponse.json(row)
  } catch (err) {
    console.error("Database DELETE error:", err)
    return bad(`Delete failed: ${err}`, 500)
  }
}
