// Simple encryption/decryption for .mp files
export function encryptMealPlan(mealPlan: any): string {
  const jsonString = JSON.stringify(mealPlan)
  const encoded = btoa(jsonString)
  // Simple Caesar cipher for additional obfuscation
  return encoded
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) + 3))
    .join("")
}

export function decryptMealPlan(encryptedData: string): any {
  try {
    // Reverse Caesar cipher
    const decoded = encryptedData
      .split("")
      .map((char) => String.fromCharCode(char.charCodeAt(0) - 3))
      .join("")
    const jsonString = atob(decoded)
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error("Invalid or corrupted meal plan file")
  }
}

export function generateMealTimes() {
  return {
    breakfast: "7:30 AM",
    lunch: "12:30 PM",
    dinner: "6:30 PM",
  }
}
