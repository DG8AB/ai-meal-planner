// Advanced date utilities for smart meal planning

export function getSmartWeekRange() {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Calculate start date (today)
  const startDate = new Date(today)

  // Calculate end date (same day next week)
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 7)

  return {
    startDate,
    endDate,
    startDay: getDayName(currentDay),
    totalDays: 7,
  }
}

export function getDayName(dayIndex: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayIndex]
}

export function getWeekDaysFromToday(): string[] {
  const today = new Date()
  const currentDay = today.getDay()
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Reorder days starting from today
  const reorderedDays = []
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDay + i) % 7
    reorderedDays.push(days[dayIndex])
  }

  return reorderedDays
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: startDate.getFullYear() !== endDate.getFullYear() ? "numeric" : undefined,
  }

  const start = startDate.toLocaleDateString("en-US", options)
  const end = endDate.toLocaleDateString("en-US", options)

  return `${start} - ${end}`
}

export function getDateForDay(dayName: string, weekStartDate: Date): Date {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayIndex = days.indexOf(dayName)
  const startDayIndex = weekStartDate.getDay()

  const date = new Date(weekStartDate)
  const daysToAdd = (dayIndex - startDayIndex + 7) % 7
  date.setDate(weekStartDate.getDate() + daysToAdd)

  return date
}

export function isCurrentWeek(weekOf: string): boolean {
  const weekDate = new Date(weekOf)
  const today = new Date()
  const weekStart = new Date(weekDate)
  const weekEnd = new Date(weekDate)
  weekEnd.setDate(weekStart.getDate() + 6)

  return today >= weekStart && today <= weekEnd
}

export function getDaysUntilExpiry(weekOf: string): number {
  const weekDate = new Date(weekOf)
  const weekEnd = new Date(weekDate)
  weekEnd.setDate(weekDate.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const today = new Date()
  const diffTime = weekEnd.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}
