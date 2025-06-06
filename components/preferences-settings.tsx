"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { DietaryPreferences } from "@/types/meal-planning"

interface PreferencesSettingsProps {
  preferences: DietaryPreferences
  onPreferencesUpdate: (preferences: DietaryPreferences) => void
}

const DIET_TYPES = [
  { value: "balanced", label: "Balanced" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "low-carb", label: "Low Carb" },
  { value: "high-protein", label: "High Protein" },
]

const COMMON_ALLERGIES = ["nuts", "dairy", "gluten", "eggs", "soy", "shellfish", "fish", "sesame"]

const BUDGET_RANGES = [
  { value: "low", label: "Budget-Friendly ($)" },
  { value: "medium", label: "Moderate ($$)" },
  { value: "high", label: "Premium ($$$)" },
]

export default function PreferencesSettings({ preferences, onPreferencesUpdate }: PreferencesSettingsProps) {
  const [localPreferences, setLocalPreferences] = useState<DietaryPreferences>(preferences)
  const [newDislike, setNewDislike] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onPreferencesUpdate(localPreferences)
      toast({
        title: "Preferences saved",
        description: "Your dietary preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleAllergy = (allergy: string) => {
    const newAllergies = localPreferences.allergies.includes(allergy)
      ? localPreferences.allergies.filter((a) => a !== allergy)
      : [...localPreferences.allergies, allergy]

    setLocalPreferences({ ...localPreferences, allergies: newAllergies })
  }

  const addDislike = () => {
    if (newDislike.trim() && !localPreferences.dislikes.includes(newDislike.trim())) {
      setLocalPreferences({
        ...localPreferences,
        dislikes: [...localPreferences.dislikes, newDislike.trim()],
      })
      setNewDislike("")
    }
  }

  const removeDislike = (dislike: string) => {
    setLocalPreferences({
      ...localPreferences,
      dislikes: localPreferences.dislikes.filter((d) => d !== dislike),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dietary Preferences
          </CardTitle>
          <CardDescription>
            Customize your meal planning preferences to get personalized recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="diet-type">Diet Type</Label>
              <Select
                value={localPreferences.dietType}
                onValueChange={(value) => setLocalPreferences({ ...localPreferences, dietType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIET_TYPES.map((diet) => (
                    <SelectItem key={diet.value} value={diet.value}>
                      {diet.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serving-size">Serving Size (people)</Label>
              <Input
                id="serving-size"
                type="number"
                min="1"
                max="12"
                value={localPreferences.servingSize}
                onChange={(e) =>
                  setLocalPreferences({
                    ...localPreferences,
                    servingSize: Number.parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Select
                value={localPreferences.budgetRange}
                onValueChange={(value) =>
                  setLocalPreferences({
                    ...localPreferences,
                    budgetRange: value as "low" | "medium" | "high",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((budget) => (
                    <SelectItem key={budget.value} value={budget.value}>
                      {budget.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Allergies & Restrictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Common Allergies</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COMMON_ALLERGIES.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={localPreferences.allergies.includes(allergy)}
                      onCheckedChange={() => toggleAllergy(allergy)}
                    />
                    <Label htmlFor={allergy} className="capitalize text-sm">
                      {allergy}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Food Dislikes</CardTitle>
          <CardDescription>Add foods or ingredients you prefer to avoid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., mushrooms, spicy food..."
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDislike()}
            />
            <Button onClick={addDislike} size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localPreferences.dislikes.map((dislike) => (
              <Badge key={dislike} variant="secondary" className="flex items-center gap-1">
                {dislike}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeDislike(dislike)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={handleSave} size="lg" className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
