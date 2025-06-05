"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Download } from "lucide-react"
import type { MealPlan } from "@/types/meal-planning"

interface ShoppingListProps {
  mealPlan: MealPlan | null
}

interface ShoppingItem {
  name: string
  category: string
  meals: string[]
  checked: boolean
}

const CATEGORIES = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry", "Frozen", "Bakery", "Other"]

export default function ShoppingList({ mealPlan }: ShoppingListProps) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (mealPlan) {
      generateShoppingList()
    }
  }, [mealPlan])

  const generateShoppingList = () => {
    if (!mealPlan) return

    const ingredientMap = new Map<string, { category: string; meals: Set<string> }>()

    // Collect all ingredients from all meals
    Object.entries(mealPlan.meals).forEach(([day, dayMeals]) => {
      Object.entries(dayMeals).forEach(([mealType, meal]) => {
        meal.ingredients.forEach((ingredient) => {
          const cleanIngredient = ingredient.toLowerCase().trim()
          const category = categorizeIngredient(ingredient)

          if (!ingredientMap.has(cleanIngredient)) {
            ingredientMap.set(cleanIngredient, {
              category,
              meals: new Set(),
            })
          }

          ingredientMap.get(cleanIngredient)!.meals.add(`${day} ${mealType}: ${meal.name}`)
        })
      })
    })

    // Convert to shopping list format
    const list: ShoppingItem[] = Array.from(ingredientMap.entries()).map(([ingredient, data]) => ({
      name: ingredient,
      category: data.category,
      meals: Array.from(data.meals),
      checked: checkedItems.has(ingredient),
    }))

    // Sort by category
    list.sort((a, b) => {
      const categoryOrder = CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)
      if (categoryOrder !== 0) return categoryOrder
      return a.name.localeCompare(b.name)
    })

    setShoppingList(list)
  }

  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase()

    if (
      lower.includes("chicken") ||
      lower.includes("beef") ||
      lower.includes("pork") ||
      lower.includes("fish") ||
      lower.includes("salmon") ||
      lower.includes("shrimp")
    ) {
      return "Meat & Seafood"
    }
    if (
      lower.includes("milk") ||
      lower.includes("cheese") ||
      lower.includes("yogurt") ||
      lower.includes("butter") ||
      lower.includes("egg")
    ) {
      return "Dairy & Eggs"
    }
    if (lower.includes("bread") || lower.includes("bagel") || lower.includes("roll")) {
      return "Bakery"
    }
    if (lower.includes("frozen") || lower.includes("ice cream")) {
      return "Frozen"
    }
    if (
      lower.includes("tomato") ||
      lower.includes("onion") ||
      lower.includes("lettuce") ||
      lower.includes("carrot") ||
      lower.includes("apple") ||
      lower.includes("banana")
    ) {
      return "Produce"
    }
    if (
      lower.includes("rice") ||
      lower.includes("pasta") ||
      lower.includes("flour") ||
      lower.includes("oil") ||
      lower.includes("salt") ||
      lower.includes("pepper")
    ) {
      return "Pantry"
    }

    return "Other"
  }

  const toggleItem = (itemName: string) => {
    const newCheckedItems = new Set(checkedItems)
    if (newCheckedItems.has(itemName)) {
      newCheckedItems.delete(itemName)
    } else {
      newCheckedItems.add(itemName)
    }
    setCheckedItems(newCheckedItems)

    // Update the shopping list
    setShoppingList((prev) => prev.map((item) => (item.name === itemName ? { ...item, checked: !item.checked } : item)))
  }

  const exportList = () => {
    const listText = CATEGORIES.map((category) => {
      const categoryItems = shoppingList.filter((item) => item.category === category)
      if (categoryItems.length === 0) return ""

      return `${category}:\n${categoryItems.map((item) => `- ${item.name}`).join("\n")}\n`
    })
      .filter(Boolean)
      .join("\n")

    const blob = new Blob([listText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "shopping-list.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mealPlan) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Meal Plan Available</h3>
          <p className="text-gray-500">Generate a meal plan first to create your shopping list!</p>
        </CardContent>
      </Card>
    )
  }

  const completedItems = shoppingList.filter((item) => item.checked).length
  const totalItems = shoppingList.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping List
              </CardTitle>
              <CardDescription>Week of {new Date(mealPlan.weekOf).toLocaleDateString()}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                {completedItems}/{totalItems} items
              </Badge>
              <Button onClick={exportList} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {CATEGORIES.map((category) => {
        const categoryItems = shoppingList.filter((item) => item.category === category)
        if (categoryItems.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.name} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.name)} className="mt-1" />
                    <div className="flex-1">
                      <p className={`font-medium capitalize ${item.checked ? "line-through text-gray-500" : ""}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Used in: {item.meals.slice(0, 2).join(", ")}
                        {item.meals.length > 2 && ` +${item.meals.length - 2} more`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
