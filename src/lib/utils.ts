import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getDaysUntil(date: string | Date): number {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysTogether(anniversaryDate: string | Date): number {
  const now = new Date();
  const anniversary = new Date(anniversaryDate);
  const diffTime = now.getTime() - anniversary.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getRelativeTime(date: string | Date): string {
  const days = getDaysUntil(date);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0 && days <= 7) return `In ${days} days`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
  
  return formatDate(date);
}

export const categoryConfig = {
  Chai: { emoji: '☕', color: 'bg-amber-100 text-amber-700', bgColor: 'bg-amber-50' },
  Restaurant: { emoji: '🍽️', color: 'bg-orange-100 text-orange-700', bgColor: 'bg-orange-50' },
  Home: { emoji: '🏠', color: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50' },
  Walk: { emoji: '🚶', color: 'bg-green-100 text-green-700', bgColor: 'bg-green-50' },
  Surprise: { emoji: '🎁', color: 'bg-purple-100 text-purple-700', bgColor: 'bg-purple-50' },
};
