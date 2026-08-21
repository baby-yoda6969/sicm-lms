import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AttendanceTier = 'SAFE' | 'WARNING' | 'CRITICAL';

export function getAttendanceTier(
  percentage: number,
  criticalThreshold = 75,
  warningThreshold = 85
): AttendanceTier {
  if (percentage >= warningThreshold) return 'SAFE';
  if (percentage >= criticalThreshold) return 'WARNING';
  return 'CRITICAL';
}

export function getTierBadgeClasses(tier: AttendanceTier): string {
  switch (tier) {
    case 'SAFE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'WARNING':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'CRITICAL':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  }
}

export function getTierBadgeText(tier: AttendanceTier): string {
  switch (tier) {
    case 'SAFE':
      return 'Safe (≥85%)';
    case 'WARNING':
      return 'Warning (<85%)';
    case 'CRITICAL':
      return 'Critical Shortage (<75%)';
  }
}

// Calculate classes needed to reach 75%
export function getClassesNeededFor75(held: number, present: number, targetPercent = 75): number {
  if (held === 0) return 0;
  const current = (present / held) * 100;
  if (current >= targetPercent) return 0;
  
  // (present + x) / (held + x) = target / 100
  // 100 * (present + x) = target * (held + x)
  // 100 * present + 100x = target * held + target * x
  // x * (100 - target) = target * held - 100 * present
  const targetFraction = targetPercent / 100;
  const needed = Math.ceil((targetFraction * held - present) / (1 - targetFraction));
  return Math.max(0, needed);
}

// Calculate how many classes student can afford to miss while staying above 75%
export function getClassesCanAffordToMiss(held: number, present: number, targetPercent = 75): number {
  if (held === 0) return 0;
  const current = (present / held) * 100;
  if (current < targetPercent) return 0;

  // present / (held + x) = target / 100
  // present * 100 / target - held = x
  const maxTotal = Math.floor((present * 100) / targetPercent);
  return Math.max(0, maxTotal - held);
}

export function formatTimeSlot(start: string, end: string): string {
  return `${start} - ${end}`;
}

export function getDayName(dayIndex: number): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[dayIndex] || 'MONDAY';
}
