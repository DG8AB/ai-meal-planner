"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, Users, ChefHat, RefreshCw, Eye } from "lucide-react"
import type { MealPlan, Meal } from "@/types/meal-planning"
import MealSwapDialog from "@/components/meal-swap-dialog"
import MealPlanExport from "@/components/meal-plan-export"

interface MealPlanViewProps {
  mealPlan: MealPlan
  onMealPlanUpdate: (mealPlan: MealPlan) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const

export default function MealPlanView({ mealPlan, onMealPlanUpdate }: MealPlanViewProps) {
  const [selectedMeal, setSelectedMeal] = useState<{ day: string; mealType: string; meal: Meal } | null>(null)

  const handleMealSwap = (day: string, mealType: string, newMeal: Meal) => {
    const updatedMealPlan = {
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        [day]: {
          ...mealPlan.meals[day],
          [mealType]: newMeal,
        },
      },
    }
    onMealPlanUpdate(updatedMealPlan)
  }

  const MealCard = ({ meal, day, mealType }: { meal: Meal; day: string; mealType: string }) => (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{meal.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setSelectedMeal({ day, mealType, meal })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {meal.prepTime}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {meal.servings}
          </Badge>
          <Badge variant="outline">{meal.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
        <div className="space-y-2">
          <div>
            <h4 className="font-medium text-sm">Key Ingredients:</h4>
            <p className="text-sm text-gray-600">{meal.ingredients.slice(0, 3).join(", ")}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{meal.name}</DialogTitle>
                <DialogDescription>{meal.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meal.prepTime}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {meal.servings}
                  </Badge>
                  <Badge variant="outline">{meal.difficulty}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {meal.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {meal.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>

                {meal.mealPrepTips && (
                  <div>
                    <h4 className="font-semibold mb-2">Meal Prep Tips:</h4>
                    <p className="text-sm text-gray-600">{meal.mealPrepTips}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Weekly Meal Plan
              </CardTitle>
              <CardDescription>Generated on {new Date(mealPlan.weekOf).toLocaleDateString()}</CardDescription>
            </div>
            <MealPlanExport mealPlan={mealPlan} />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {DAYS.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-xl">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MEAL_TYPES.map((mealType) => (
                    <div key={mealType}>
                      <h4 className="font-semibold mb-2 capitalize">{mealType}</h4>
                      <MealCard meal={mealPlan.meals[day][mealType]} day={day} mealType={mealType} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {MEAL_TYPES.map((mealType) => (
            <Card key={mealType}>
              <CardHeader>
                <CardTitle className="capitalize">{mealType} for the Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAYS.map((day) => (
                    <div key={day}>
                      <h4 className="font-medium mb-2">{day}</h4>
                      <MealCard meal={mealPlan.meals[day][mealType]} day={day} mealType={mealType} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {selectedMeal && (
        <MealSwapDialog
          isOpen={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          currentMeal={selectedMeal.meal}
          onMealSwap={(newMeal) => {
            handleMealSwap(selectedMeal.day, selectedMeal.mealType, newMeal)
            setSelectedMeal(null)
          }}
        />
      )}
    </div>
  )
}
