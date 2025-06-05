export interface Meal {
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: string
  servings: number
  difficulty: "Easy" | "Medium" | "Hard"
  mealPrepTips?: string
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export interface DayMeals {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

export interface MealPlan {
  id: string
  weekOf: string
  mealTimes: {
    breakfast: string
    lunch: string
    dinner: string
  }
  meals: {
    Monday: DayMeals
    Tuesday: DayMeals
    Wednesday: DayMeals
    Thursday: DayMeals
    Friday: DayMeals
    Saturday: DayMeals
    Sunday: DayMeals
  }
}

export interface DietaryPreferences {
  dietType: string
  allergies: string[]
  dislikes: string[]
  servingSize: number
  budgetRange: "low" | "medium" | "high"
}

export interface MealPlanRequest {
  preferences: DietaryPreferences
  availableIngredients: string[]
  specialRequests: string
}
