import type { MealPlan } from "@/types/meal-planning"
import { encryptMealPlan } from "./encryption-utils"

// Generate a shareable link for a meal plan
export function generateShareableLink(mealPlan: MealPlan): string {
  const encodedPlan = btoa(JSON.stringify(mealPlan))
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  return `${baseUrl}/shared/${encodedPlan}`
}

// Export meal plan as encrypted .mp file
export function exportAsMPFile(mealPlan: MealPlan): void {
  const encryptedData = encryptMealPlan(mealPlan)
  const weekOf = new Date(mealPlan.weekOf).toLocaleDateString().replace(/\//g, "-")
  const filename = `meal-plan-${weekOf}.mp`

  const blob = new Blob([encryptedData], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export meal plan as text with meal times
export function exportAsText(mealPlan: MealPlan): string {
  const weekOf = new Date(mealPlan.weekOf).toLocaleDateString()
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  let text = `MEAL PLAN - Week of ${weekOf}\n`
  text += "=" * 50 + "\n\n"

  text += `MEAL TIMES:\n`
  text += `🌅 Breakfast: ${mealPlan.mealTimes.breakfast}\n`
  text += `🌞 Lunch: ${mealPlan.mealTimes.lunch}\n`
  text += `🌙 Dinner: ${mealPlan.mealTimes.dinner}\n\n`

  days.forEach((day) => {
    text += `${day.toUpperCase()}\n`
    text += "-" * day.length + "\n"

    const dayMeals = mealPlan.meals[day]

    // Breakfast
    text += `🌅 BREAKFAST (${mealPlan.mealTimes.breakfast}): ${dayMeals.breakfast.name}\n`
    text += `   ${dayMeals.breakfast.description}\n`
    text += `   Prep Time: ${dayMeals.breakfast.prepTime} | Difficulty: ${dayMeals.breakfast.difficulty}\n`
    text += `   Ingredients: ${dayMeals.breakfast.ingredients.join(", ")}\n\n`

    // Lunch
    text += `🌞 LUNCH (${mealPlan.mealTimes.lunch}): ${dayMeals.lunch.name}\n`
    text += `   ${dayMeals.lunch.description}\n`
    text += `   Prep Time: ${dayMeals.lunch.prepTime} | Difficulty: ${dayMeals.lunch.difficulty}\n`
    text += `   Ingredients: ${dayMeals.lunch.ingredients.join(", ")}\n\n`

    // Dinner
    text += `🌙 DINNER (${mealPlan.mealTimes.dinner}): ${dayMeals.dinner.name}\n`
    text += `   ${dayMeals.dinner.description}\n`
    text += `   Prep Time: ${dayMeals.dinner.prepTime} | Difficulty: ${dayMeals.dinner.difficulty}\n`
    text += `   Ingredients: ${dayMeals.dinner.ingredients.join(", ")}\n\n`

    text += "\n"
  })

  return text
}

// Export meal plan as CSV with meal times
export function exportAsCSV(mealPlan: MealPlan): string {
  const weekOf = new Date(mealPlan.weekOf).toLocaleDateString()
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  let csv = "Day,Meal Type,Meal Time,Name,Description,Prep Time,Difficulty,Ingredients\n"

  days.forEach((day) => {
    const dayMeals = mealPlan.meals[day]

    // Add breakfast
    csv += `${day},Breakfast,${mealPlan.mealTimes.breakfast},"${dayMeals.breakfast.name}","${dayMeals.breakfast.description}",${dayMeals.breakfast.prepTime},${dayMeals.breakfast.difficulty},"${dayMeals.breakfast.ingredients.join("; ")}"\n`

    // Add lunch
    csv += `${day},Lunch,${mealPlan.mealTimes.lunch},"${dayMeals.lunch.name}","${dayMeals.lunch.description}",${dayMeals.lunch.prepTime},${dayMeals.lunch.difficulty},"${dayMeals.lunch.ingredients.join("; ")}"\n`

    // Add dinner
    csv += `${day},Dinner,${mealPlan.mealTimes.dinner},"${dayMeals.dinner.name}","${dayMeals.dinner.description}",${dayMeals.dinner.prepTime},${dayMeals.dinner.difficulty},"${dayMeals.dinner.ingredients.join("; ")}"\n`
  })

  return csv
}

// Generate shopping list text
export function exportShoppingListAsText(mealPlan: MealPlan): string {
  const weekOf = new Date(mealPlan.weekOf).toLocaleDateString()
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Collect all ingredients
  const ingredientMap = new Map<string, Set<string>>()

  days.forEach((day) => {
    const dayMeals = mealPlan.meals[day]
    ;[dayMeals.breakfast, dayMeals.lunch, dayMeals.dinner].forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const cleanIngredient = ingredient.toLowerCase().trim()
        if (!ingredientMap.has(cleanIngredient)) {
          ingredientMap.set(cleanIngredient, new Set())
        }
        ingredientMap.get(cleanIngredient)!.add(`${day} ${meal.name}`)
      })
    })
  })

  let text = `SHOPPING LIST - Week of ${weekOf}\n`
  text += "=" * 40 + "\n\n"

  // Categorize ingredients
  const categories = {
    Produce: [
      "tomato",
      "onion",
      "lettuce",
      "carrot",
      "apple",
      "banana",
      "avocado",
      "cucumber",
      "bell pepper",
      "broccoli",
      "spinach",
    ],
    "Meat & Seafood": ["chicken", "beef", "pork", "fish", "salmon", "shrimp", "turkey"],
    "Dairy & Eggs": ["milk", "cheese", "yogurt", "butter", "egg", "cream"],
    Pantry: ["rice", "pasta", "flour", "oil", "salt", "pepper", "sugar", "spices", "herbs"],
    Frozen: ["frozen"],
    Bakery: ["bread", "bagel", "roll"],
  }

  Object.entries(categories).forEach(([category, keywords]) => {
    const categoryItems = Array.from(ingredientMap.keys()).filter((ingredient) =>
      keywords.some((keyword) => ingredient.includes(keyword)),
    )

    if (categoryItems.length > 0) {
      text += `${category.toUpperCase()}\n`
      text += "-" * category.length + "\n"
      categoryItems.forEach((ingredient) => {
        text += `☐ ${ingredient}\n`
      })
      text += "\n"
    }
  })

  // Other items
  const categorizedItems = new Set()
  Object.values(categories)
    .flat()
    .forEach((keyword) => {
      Array.from(ingredientMap.keys()).forEach((ingredient) => {
        if (ingredient.includes(keyword)) {
          categorizedItems.add(ingredient)
        }
      })
    })

  const otherItems = Array.from(ingredientMap.keys()).filter((ingredient) => !categorizedItems.has(ingredient))
  if (otherItems.length > 0) {
    text += "OTHER\n"
    text += "-----\n"
    otherItems.forEach((ingredient) => {
      text += `☐ ${ingredient}\n`
    })
  }

  return text
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

// Generate meal plan summary for sharing
export function generateMealPlanSummary(mealPlan: MealPlan): string {
  const weekOf = new Date(mealPlan.weekOf).toLocaleDateString()
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  let summary = `🍽️ Meal Plan for Week of ${weekOf}\n\n`
  summary += `⏰ Meal Times:\n`
  summary += `🌅 Breakfast: ${mealPlan.mealTimes.breakfast}\n`
  summary += `🌞 Lunch: ${mealPlan.mealTimes.lunch}\n`
  summary += `🌙 Dinner: ${mealPlan.mealTimes.dinner}\n\n`

  days.forEach((day) => {
    const dayMeals = mealPlan.meals[day]
    summary += `${day}:\n`
    summary += `• Breakfast: ${dayMeals.breakfast.name}\n`
    summary += `• Lunch: ${dayMeals.lunch.name}\n`
    summary += `• Dinner: ${dayMeals.dinner.name}\n\n`
  })

  summary += "Generated with AI Meal Planning Assistant"

  return summary
}
