"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Clock, Users } from "lucide-react"
import type { Meal } from "@/types/meal-planning"
import { generateMealAlternatives } from "@/lib/ai-service"

interface MealSwapDialogProps {
  isOpen: boolean
  onClose: () => void
  currentMeal: Meal
  onMealSwap: (newMeal: Meal) => void
}

export default function MealSwapDialog({ isOpen, onClose, currentMeal, onMealSwap }: MealSwapDialogProps) {
  const [alternatives, setAlternatives] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const generateAlternatives = async () => {
    setIsLoading(true)
    try {
      const newAlternatives = await generateMealAlternatives(currentMeal, searchQuery)
      setAlternatives(newAlternatives)
    } catch (error) {
      console.error("Error generating alternatives:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMealSelect = (meal: Meal) => {
    onMealSwap(meal)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Swap Meal: {currentMeal.name}</DialogTitle>
          <DialogDescription>Find alternative meals that match your preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for specific cuisines, ingredients, or meal types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={generateAlternatives} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {alternatives.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alternatives.map((meal, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
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
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-1">Key Ingredients:</h4>
                      <p className="text-sm text-gray-600">{meal.ingredients.slice(0, 4).join(", ")}</p>
                    </div>
                    <Button onClick={() => handleMealSelect(meal)} className="w-full" variant="outline">
                      Select This Meal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {alternatives.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Click search to find alternative meals</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
