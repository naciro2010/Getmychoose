import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate delivery price
export function calculatePrice(
  distance: number,
  packageType: string,
  isUrgent: boolean = false
): {
  basePrice: number
  urgencyFee: number
  totalPrice: number
  driverEarnings: number
  commission: number
} {
  // Base price per km
  const pricePerKm = 1.5

  // Package type multipliers
  const packageMultipliers: Record<string, number> = {
    SMALL: 1.0,
    MEDIUM: 1.3,
    LARGE: 1.6,
    EXTRA_LARGE: 2.0,
  }

  const multiplier = packageMultipliers[packageType] || 1.0
  const basePrice = Math.max(5, distance * pricePerKm * multiplier) // Minimum 5€
  const urgencyFee = isUrgent ? basePrice * 0.3 : 0 // 30% urgency fee
  const totalPrice = basePrice + urgencyFee

  const commissionRate = 0.15 // 15% commission
  const commission = totalPrice * commissionRate
  const driverEarnings = totalPrice - commission

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    urgencyFee: Math.round(urgencyFee * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    driverEarnings: Math.round(driverEarnings * 100) / 100,
    commission: Math.round(commission * 100) / 100,
  }
}

// Generate unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GMC-${timestamp}-${random}`
}

// Generate QR code data
export function generateQRCodeData(orderId: string): string {
  return `GMC-ORDER-${orderId}-${Date.now()}`
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

// Estimate delivery time based on distance
export function estimateDeliveryTime(distance: number): number {
  // Average speed: 30 km/h in city
  const averageSpeed = 30
  const hours = distance / averageSpeed
  return Math.ceil(hours * 60) // Return minutes
}
