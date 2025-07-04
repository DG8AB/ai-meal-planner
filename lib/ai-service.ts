import type { MealPlan, MealPlanRequest, Meal } from "@/types/meal-planning"
import { generateMealTimes } from "./encryption-utils"
import { getSmartWeekRange, getWeekDaysFromToday, formatDateRange } from "./date-utils"

// -----------------------------------------------------------------------------
// TEMPORARY SWITCH: Disable external Puter AI calls while permission errors
// persist.  When you regain API access, just set AI_ENABLED back to true.
// -----------------------------------------------------------------------------
const AI_ENABLED = false

// Declare puter as a global variable
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string | any[], options?: { model?: string; stream?: boolean }) => Promise<any>
      }
    }
  }
}

// Function to wait for Puter.js to load
function waitForPuter(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.puter) {
      resolve()
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (typeof window !== "undefined" && window.puter) {
        clearInterval(checkInterval)
        resolve()
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        reject(new Error("Puter.js failed to load within timeout"))
      }
    }, 100)
  })
}

// Function to load Puter.js dynamically if not already loaded
function loadPuterScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Not in browser environment"))
      return
    }

    // Check if already loaded
    if (window.puter) {
      resolve()
      return
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="js.puter.com"]')
    if (existingScript) {
      // Script exists, wait for it to load
      waitForPuter().then(resolve).catch(reject)
      return
    }

    // Create and load the script
    const script = document.createElement("script")
    script.src = "https://js.puter.com/v2/"
    script.async = true

    script.onload = () => {
      waitForPuter().then(resolve).catch(reject)
    }

    script.onerror = () => {
      reject(new Error("Failed to load Puter.js script"))
    }

    document.head.appendChild(script)
  })
}

async function callPuterAI(prompt: string | any[], options = {}) {
  try {
    // Ensure Puter.js is loaded
    await loadPuterScript()

    if (!window.puter || !window.puter.ai) {
      throw new Error("Puter.js AI not available")
    }

    console.log("Calling Puter AI with model: gpt-4o-mini")
    const response = await window.puter.ai.chat(prompt, {
      model: "gpt-4o-mini",
      ...options,
    })

    console.log("Puter AI response received:", typeof response)
    return response
  } catch (error) {
    console.error("Puter AI call failed:", error)
    throw error
  }
}

export async function generateMealPlan(request: MealPlanRequest): Promise<MealPlan> {
  // Shortcut: if we deliberately disabled AI (or want to skip when in prod
  // without a key), jump straight to the fallback generator.
  if (!AI_ENABLED) {
    return generateIntelligentMealPlan(request)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ORIGINAL LOGIC BELOW (unchanged) ……
  // ────────────────────────────────────────────────────────────────────────────

  const mealTimes = generateMealTimes()
  const weekRange = getSmartWeekRange()
  const weekDays = getWeekDaysFromToday()
  const dateRange = formatDateRange(weekRange.startDate, weekRange.endDate)

  console.log("Generating meal plan for week:", dateRange)
  console.log("Days order:", weekDays)

  const prompt = `You are a professional nutritionist and meal planning expert. Create a detailed 7-day meal plan as a JSON object.

IMPORTANT: This meal plan is for the week starting TODAY (${weekRange.startDate.toLocaleDateString()}) and ending on ${weekRange.endDate.toLocaleDateString()}.

The days should be in this EXACT order: ${weekDays.join(", ")}

Requirements:
- Diet Type: ${request.preferences.dietType}
- Serving Size: ${request.preferences.servingSize} people
- Budget: ${request.preferences.budgetRange}
- Allergies to avoid: ${request.preferences.allergies.join(", ") || "None"}
- Foods to avoid: ${request.preferences.dislikes.join(", ") || "None"}
- Available ingredients: ${request.availableIngredients.join(", ") || "None specified"}
- Special requests: ${request.specialRequests || "None"}

Meal Times:
- Breakfast: ${mealTimes.breakfast}
- Lunch: ${mealTimes.lunch}
- Dinner: ${mealTimes.dinner}

Return ONLY a valid JSON object with this exact structure (no markdown formatting):
{
  "id": "${Date.now()}",
  "weekOf": "${weekRange.startDate.toISOString()}",
  "mealTimes": {
    "breakfast": "${mealTimes.breakfast}",
    "lunch": "${mealTimes.lunch}",
    "dinner": "${mealTimes.dinner}"
  },
  "meals": {
    "${weekDays[0]}": {
      "breakfast": {
        "name": "Healthy Breakfast Name",
        "description": "Brief appetizing description",
        "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity", "ingredient3 with quantity"],
        "instructions": ["Clear step 1", "Clear step 2", "Clear step 3", "Clear step 4"],
        "prepTime": "15 minutes",
        "servings": ${request.preferences.servingSize},
        "difficulty": "Easy",
        "mealPrepTips": "Helpful preparation tip"
      },
      "lunch": {
        "name": "Nutritious Lunch Name",
        "description": "Brief appetizing description",
        "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity"],
        "instructions": ["Clear step 1", "Clear step 2", "Clear step 3"],
        "prepTime": "25 minutes",
        "servings": ${request.preferences.servingSize},
        "difficulty": "Medium",
        "mealPrepTips": "Helpful preparation tip"
      },
      "dinner": {
        "name": "Delicious Dinner Name",
        "description": "Brief appetizing description",
        "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity"],
        "instructions": ["Clear step 1", "Clear step 2", "Clear step 3", "Clear step 4"],
        "prepTime": "35 minutes",
        "servings": ${request.preferences.servingSize},
        "difficulty": "Medium",
        "mealPrepTips": "Helpful preparation tip"
      }
    },
    "${weekDays[1]}": {
      "breakfast": { /* similar structure */ },
      "lunch": { /* similar structure */ },
      "dinner": { /* similar structure */ }
    },
    "${weekDays[2]}": {
      "breakfast": { /* similar structure */ },
      "lunch": { /* similar structure */ },
      "dinner": { /* similar structure */ }
    },
    "${weekDays[3]}": {
      "breakfast": { /* similar structure */ },
      "lunch": { /* similar structure */ },
      "dinner": { /* similar structure */ }
    },
    "${weekDays[4]}": {
      "breakfast": { /* similar structure */ },
      "lunch": { /* similar structure */ },
      "dinner": { /* similar structure */ }
    },
    "${weekDays[5]}": {
      "breakfast": { /* similar structure */ },
      "lunch": { /* similar structure */ },
      "dinner": { /* similar structure */ }
    },
    "${weekDays[6]}": {
      "breakfast": { /* similar structure */ },
      "lunch": { /* similar structure */ },
      "dinner": { /* similar structure */ }
    }
  }
}

Make sure to:
- Include all 7 days with complete breakfast, lunch, and dinner for each day
- Use the EXACT day names provided: ${weekDays.join(", ")}
- Make meals varied and interesting throughout the week
- Respect all dietary restrictions and preferences
- Include specific quantities in ingredients
- Provide clear, actionable cooking instructions
- Make meals nutritionally balanced and appropriate for the diet type
- Use available ingredients when possible
- Consider the current season and time of year for ingredient availability`

  try {
    console.log("Generating meal plan with Puter AI...")
    const response = await callPuterAI(prompt)

    console.log("Raw AI response type:", typeof response)
    console.log("Raw AI response:", typeof response === "string" ? response.substring(0, 200) + "..." : response)

    // Handle different response formats from Puter
    let responseText = ""
    if (typeof response === "string") {
      responseText = response
    } else if (response && response.message && response.message.content) {
      responseText = response.message.content
    } else if (response && response.content) {
      responseText = response.content
    } else if (response && typeof response === "object") {
      // Try to stringify and see if it's already a JSON object
      try {
        responseText = JSON.stringify(response)
      } catch {
        responseText = String(response)
      }
    } else {
      responseText = String(response)
    }

    // Clean the response - remove any markdown formatting or extra text
    let cleanResponse = responseText.trim()

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Find JSON object in the response
    const jsonStart = cleanResponse.indexOf("{")
    const jsonEnd = cleanResponse.lastIndexOf("}") + 1

    if (jsonStart === -1 || jsonEnd === 0) {
      console.log("No JSON found in response, using fallback")
      throw new Error("No JSON object found in response")
    }

    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd)

    console.log("Cleaned response:", cleanResponse.substring(0, 200) + "...")

    // Parse the JSON response
    const mealPlan = JSON.parse(cleanResponse)

    // Validate the meal plan structure
    if (!mealPlan.meals || typeof mealPlan.meals !== "object") {
      throw new Error("Invalid meal plan structure - missing meals object")
    }

    // Ensure meal times are included
    if (!mealPlan.mealTimes) {
      mealPlan.mealTimes = mealTimes
    }

    // Validate that all required days are present
    const requiredMeals = ["breakfast", "lunch", "dinner"]

    for (const day of weekDays) {
      if (!mealPlan.meals[day]) {
        throw new Error(`Missing day: ${day}`)
      }
      for (const mealType of requiredMeals) {
        if (!mealPlan.meals[day][mealType]) {
          throw new Error(`Missing ${mealType} for ${day}`)
        }
      }
    }

    console.log("AI meal plan generated successfully!")
    return mealPlan
  } catch (error) {
    console.error("Error generating meal plan with AI:", error)
    console.log("Falling back to intelligent meal plan...")

    // Return intelligent fallback meal plan with smart dates
    return generateIntelligentMealPlan(request)
  }
}

export async function generateMealAlternatives(currentMeal: Meal, searchQuery = ""): Promise<Meal[]> {
  const prompt = `Create 3 alternative meals similar to "${currentMeal.name}".

Current meal details:
- Name: ${currentMeal.name}
- Description: ${currentMeal.description}
- Prep time: ${currentMeal.prepTime}
- Difficulty: ${currentMeal.difficulty}
- Search preference: ${searchQuery || "Similar style and difficulty"}

Return ONLY a valid JSON array with 3 meal objects (no markdown formatting):
[
  {
    "name": "Alternative Meal 1",
    "description": "Brief appetizing description",
    "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity", "ingredient3 with quantity"],
    "instructions": ["Clear step 1", "Clear step 2", "Clear step 3"],
    "prepTime": "${currentMeal.prepTime}",
    "servings": ${currentMeal.servings},
    "difficulty": "${currentMeal.difficulty}",
    "mealPrepTips": "Helpful prep tip"
  },
  {
    "name": "Alternative Meal 2",
    "description": "Brief appetizing description",
    "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity", "ingredient3 with quantity"],
    "instructions": ["Clear step 1", "Clear step 2", "Clear step 3"],
    "prepTime": "${currentMeal.prepTime}",
    "servings": ${currentMeal.servings},
    "difficulty": "${currentMeal.difficulty}",
    "mealPrepTips": "Helpful prep tip"
  },
  {
    "name": "Alternative Meal 3",
    "description": "Brief appetizing description",
    "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity", "ingredient3 with quantity"],
    "instructions": ["Clear step 1", "Clear step 2", "Clear step 3"],
    "prepTime": "${currentMeal.prepTime}",
    "servings": ${currentMeal.servings},
    "difficulty": "${currentMeal.difficulty}",
    "mealPrepTips": "Helpful prep tip"
  }
]`

  try {
    const response = await callPuterAI(prompt)

    // Handle different response formats
    let responseText = ""
    if (typeof response === "string") {
      responseText = response
    } else if (response && response.message && response.message.content) {
      responseText = response.message.content
    } else if (response && response.content) {
      responseText = response.content
    } else {
      responseText = String(response)
    }

    // Clean the response
    let cleanResponse = responseText.trim()
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Find JSON array in the response
    const arrayStart = cleanResponse.indexOf("[")
    const arrayEnd = cleanResponse.lastIndexOf("]") + 1

    if (arrayStart !== -1 && arrayEnd > 0) {
      cleanResponse = cleanResponse.substring(arrayStart, arrayEnd)
    }

    const alternatives = JSON.parse(cleanResponse)

    if (!Array.isArray(alternatives) || alternatives.length === 0) {
      throw new Error("Invalid alternatives format")
    }

    return alternatives
  } catch (error) {
    console.error("Error generating alternatives:", error)
    return generateFallbackAlternatives(currentMeal)
  }
}

function generateIntelligentMealPlan(request: MealPlanRequest): MealPlan {
  const weekDays = getWeekDaysFromToday()
  const weekRange = getSmartWeekRange()
  const meals: any = {}
  const mealTimes = generateMealTimes()

  // Create meal database based on dietary preferences
  const mealDatabase = createMealDatabase(request.preferences)

  weekDays.forEach((day, dayIndex) => {
    meals[day] = {
      breakfast: selectMeal(mealDatabase.breakfast, dayIndex, request),
      lunch: selectMeal(mealDatabase.lunch, dayIndex, request),
      dinner: selectMeal(mealDatabase.dinner, dayIndex, request),
    }
  })

  return {
    id: Date.now().toString(),
    weekOf: weekRange.startDate.toISOString(),
    mealTimes,
    meals,
  }
}

function createMealDatabase(preferences: any) {
  const isVegetarian = preferences.dietType === "vegetarian" || preferences.dietType === "vegan"
  const isVegan = preferences.dietType === "vegan"
  const isKeto = preferences.dietType === "keto"
  const isLowCarb = preferences.dietType === "low-carb"
  const isMediterranean = preferences.dietType === "mediterranean"

  const breakfast = [
    {
      name: "Greek Yogurt Parfait",
      description: "Creamy yogurt layered with berries and granola",
      ingredients: ["1 cup Greek yogurt", "1/2 cup mixed berries", "1/4 cup granola", "1 tbsp honey", "chopped nuts"],
      instructions: [
        "Layer yogurt in a bowl or glass",
        "Add berries and granola",
        "Drizzle with honey",
        "Top with chopped nuts",
      ],
      prepTime: "5 minutes",
      servings: preferences.servingSize,
      difficulty: "Easy" as const,
      mealPrepTips: "Prepare parfaits in mason jars for grab-and-go breakfasts",
      suitable: !isVegan,
    },
    {
      name: "Avocado Toast with Eggs",
      description: "Whole grain toast topped with mashed avocado and eggs",
      ingredients: ["2 slices whole grain bread", "1 ripe avocado", "2 eggs", "salt", "pepper", "red pepper flakes"],
      instructions: [
        "Toast bread slices until golden",
        "Mash avocado with salt and pepper",
        "Cook eggs to preference",
        "Spread avocado on toast and top with eggs",
      ],
      prepTime: "10 minutes",
      servings: preferences.servingSize,
      difficulty: "Easy" as const,
      mealPrepTips: "Prepare avocado mixture fresh to prevent browning",
      suitable: !isVegan,
    },
    {
      name: "Overnight Oats",
      description: "No-cook oats soaked overnight with your favorite toppings",
      ingredients: [
        "1/2 cup rolled oats",
        "1/2 cup plant milk",
        "1 tbsp chia seeds",
        "1 tbsp maple syrup",
        "fresh fruit",
      ],
      instructions: [
        "Mix oats, milk, chia seeds, and maple syrup",
        "Refrigerate overnight",
        "Top with fresh fruit before serving",
        "Add nuts or seeds for extra protein",
      ],
      prepTime: "5 minutes",
      servings: preferences.servingSize,
      difficulty: "Easy" as const,
      mealPrepTips: "Make 5 jars at once for the whole work week",
      suitable: true,
    },
    {
      name: "Smoothie Bowl",
      description: "Thick smoothie topped with fresh fruits and seeds",
      ingredients: [
        "1 frozen banana",
        "1/2 cup berries",
        "1/2 cup plant milk",
        "1 tbsp almond butter",
        "toppings of choice",
      ],
      instructions: [
        "Blend frozen fruit with minimal liquid until thick",
        "Pour into bowl",
        "Arrange toppings artfully",
        "Serve immediately",
      ],
      prepTime: "8 minutes",
      servings: preferences.servingSize,
      difficulty: "Easy" as const,
      mealPrepTips: "Pre-portion frozen fruit in bags for quick blending",
      suitable: true,
    },
    {
      name: "Keto Scrambled Eggs",
      description: "Fluffy scrambled eggs with cheese and herbs",
      ingredients: ["3 eggs", "2 tbsp butter", "1/4 cup cheese", "fresh herbs", "salt", "pepper"],
      instructions: [
        "Beat eggs with salt and pepper",
        "Heat butter in non-stick pan",
        "Add eggs and scramble gently",
        "Fold in cheese and herbs",
      ],
      prepTime: "8 minutes",
      servings: preferences.servingSize,
      difficulty: "Easy" as const,
      mealPrepTips: "Use room temperature eggs for fluffier results",
      suitable: isKeto || isLowCarb,
    },
  ]

  const lunch = [
    {
      name: "Mediterranean Quinoa Bowl",
      description: "Protein-rich quinoa with Mediterranean vegetables and feta",
      ingredients: [
        "1 cup cooked quinoa",
        "1/2 cup chickpeas",
        "cucumber",
        "tomatoes",
        "olives",
        "feta cheese",
        "olive oil",
      ],
      instructions: [
        "Cook quinoa according to package directions",
        "Dice cucumber and tomatoes",
        "Combine quinoa with vegetables",
        "Top with feta and drizzle with olive oil",
      ],
      prepTime: "20 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Cook quinoa in batches and store for quick assembly",
      suitable: !isVegan && (isMediterranean || preferences.dietType === "balanced"),
    },
    {
      name: "Asian Lettuce Wraps",
      description: "Fresh lettuce cups filled with seasoned protein and vegetables",
      ingredients: [
        "butter lettuce",
        "ground turkey or tofu",
        "water chestnuts",
        "green onions",
        "soy sauce",
        "sesame oil",
      ],
      instructions: [
        "Cook protein with seasonings",
        "Add diced water chestnuts",
        "Wash and separate lettuce leaves",
        "Fill lettuce cups with mixture",
      ],
      prepTime: "15 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Prepare filling ahead and assemble just before eating",
      suitable: true,
    },
    {
      name: "Caprese Salad",
      description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
      ingredients: [
        "fresh mozzarella",
        "ripe tomatoes",
        "fresh basil",
        "balsamic vinegar",
        "olive oil",
        "salt",
        "pepper",
      ],
      instructions: [
        "Slice tomatoes and mozzarella",
        "Arrange alternating with basil leaves",
        "Drizzle with olive oil and balsamic",
        "Season with salt and pepper",
      ],
      prepTime: "10 minutes",
      servings: preferences.servingSize,
      difficulty: "Easy" as const,
      mealPrepTips: "Use room temperature ingredients for best flavor",
      suitable: !isVegan && isMediterranean,
    },
    {
      name: "Buddha Bowl",
      description: "Colorful bowl with grains, vegetables, and protein",
      ingredients: [
        "brown rice",
        "roasted vegetables",
        "protein of choice",
        "leafy greens",
        "tahini dressing",
        "seeds",
      ],
      instructions: [
        "Cook rice and roast vegetables",
        "Prepare protein (tofu, chicken, or beans)",
        "Arrange components in bowl",
        "Drizzle with tahini dressing",
      ],
      prepTime: "25 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Prep components separately and assemble fresh",
      suitable: true,
    },
  ]

  const dinner = [
    {
      name: "Herb-Crusted Salmon",
      description: "Flaky salmon with a crispy herb crust and roasted vegetables",
      ingredients: ["salmon fillets", "fresh herbs", "breadcrumbs", "lemon", "olive oil", "seasonal vegetables"],
      instructions: [
        "Preheat oven to 400°F",
        "Mix herbs with breadcrumbs and oil",
        "Top salmon with herb mixture",
        "Roast with vegetables for 15-20 minutes",
      ],
      prepTime: "25 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Marinate salmon earlier in the day for enhanced flavor",
      suitable: !isVegetarian && !isVegan,
    },
    {
      name: "Vegetable Curry",
      description: "Aromatic curry with seasonal vegetables and coconut milk",
      ingredients: ["mixed vegetables", "coconut milk", "curry spices", "onion", "garlic", "ginger", "basmati rice"],
      instructions: [
        "Sauté onion, garlic, and ginger",
        "Add curry spices and cook until fragrant",
        "Add vegetables and coconut milk",
        "Simmer until vegetables are tender",
      ],
      prepTime: "30 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Curry tastes better the next day - make extra for leftovers",
      suitable: isVegetarian || isVegan,
    },
    {
      name: "Grilled Chicken with Quinoa",
      description: "Lean grilled chicken breast with fluffy quinoa and steamed broccoli",
      ingredients: ["chicken breast", "quinoa", "broccoli", "olive oil", "lemon", "herbs", "garlic"],
      instructions: [
        "Marinate chicken with herbs and lemon",
        "Cook quinoa according to package directions",
        "Grill chicken until cooked through",
        "Steam broccoli until tender-crisp",
      ],
      prepTime: "25 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Grill extra chicken for easy meal prep throughout the week",
      suitable: !isVegetarian && !isVegan,
    },
    {
      name: "Stuffed Bell Peppers",
      description: "Colorful bell peppers stuffed with quinoa, vegetables, and cheese",
      ingredients: ["bell peppers", "quinoa", "black beans", "corn", "tomatoes", "cheese", "spices"],
      instructions: [
        "Cut tops off peppers and remove seeds",
        "Mix quinoa with beans, corn, and tomatoes",
        "Stuff peppers with mixture",
        "Bake until peppers are tender",
      ],
      prepTime: "35 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Prepare filling ahead and stuff peppers when ready to cook",
      suitable: !isVegan,
    },
    {
      name: "Zucchini Noodles with Pesto",
      description: "Light zucchini noodles tossed with fresh basil pesto",
      ingredients: ["zucchini", "fresh basil", "pine nuts", "parmesan", "garlic", "olive oil", "cherry tomatoes"],
      instructions: [
        "Spiralize zucchini into noodles",
        "Make pesto with basil, nuts, cheese, and oil",
        "Lightly sauté zucchini noodles",
        "Toss with pesto and cherry tomatoes",
      ],
      prepTime: "20 minutes",
      servings: preferences.servingSize,
      difficulty: "Medium" as const,
      mealPrepTips: "Make pesto in advance and store in refrigerator",
      suitable: isLowCarb || isKeto,
    },
  ]

  // Filter meals based on dietary restrictions
  return {
    breakfast: breakfast.filter((meal) => meal.suitable),
    lunch: lunch.filter((meal) => meal.suitable),
    dinner: dinner.filter((meal) => meal.suitable),
  }
}

function selectMeal(mealArray: any[], dayIndex: number, request: MealPlanRequest) {
  // Try to use available ingredients
  let selectedMeal = mealArray[dayIndex % mealArray.length]

  // If we have available ingredients, try to find a meal that uses them
  if (request.availableIngredients.length > 0) {
    const mealWithIngredients = mealArray.find((meal) =>
      meal.ingredients.some((ingredient) =>
        request.availableIngredients.some(
          (available) =>
            ingredient.toLowerCase().includes(available.toLowerCase()) ||
            available.toLowerCase().includes(ingredient.toLowerCase()),
        ),
      ),
    )

    if (mealWithIngredients) {
      selectedMeal = mealWithIngredients
    }
  }

  return selectedMeal
}

function generateFallbackAlternatives(currentMeal: Meal): Meal[] {
  const alternatives = [
    {
      name: `Quick ${currentMeal.name} Alternative`,
      description: `A faster version of ${currentMeal.name} with simplified ingredients`,
      ingredients: ["simplified ingredients", "pantry staples", "quick-cooking items"],
      instructions: ["Quick preparation method", "Minimal cooking time", "Easy assembly"],
      prepTime: currentMeal.prepTime,
      servings: currentMeal.servings,
      difficulty: "Easy" as const,
      mealPrepTips: "Perfect for busy weeknights when time is limited",
    },
    {
      name: `Healthy ${currentMeal.name} Swap`,
      description: `A nutritious twist on ${currentMeal.name} with added vegetables`,
      ingredients: ["lean proteins", "fresh vegetables", "whole grains", "healthy fats"],
      instructions: ["Healthy cooking method", "Add extra vegetables", "Use whole grain options"],
      prepTime: currentMeal.prepTime,
      servings: currentMeal.servings,
      difficulty: currentMeal.difficulty,
      mealPrepTips: "Great for meal prep and portion control",
    },
    {
      name: `Comfort ${currentMeal.name} Version`,
      description: `A satisfying comfort food take on ${currentMeal.name}`,
      ingredients: ["hearty ingredients", "warming spices", "comfort food elements"],
      instructions: ["Traditional cooking method", "Add warming spices", "Create satisfying portions"],
      prepTime: currentMeal.prepTime,
      servings: currentMeal.servings,
      difficulty: currentMeal.difficulty,
      mealPrepTips: "Perfect for family dinners and special occasions",
    },
  ]

  return alternatives
}
