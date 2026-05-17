import { differenceInCalendarDays } from 'date-fns'

export function calculateTotalDays(startDate: Date, endDate: Date): number {
  return Math.max(1, differenceInCalendarDays(endDate, startDate))
}

export function calculateTotalPrice(
  startDate: Date,
  endDate: Date,
  pricePerDay: number
): number {
  return calculateTotalDays(startDate, endDate) * pricePerDay
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(0)} RON`
}
