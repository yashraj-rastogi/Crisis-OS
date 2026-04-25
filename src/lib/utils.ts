import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { JOIN_CODE_LENGTH } from './constants';

// Tailwind class merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random property join code (6 chars, uppercase alphanumeric)
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let code = '';
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Format a Date for timeline display
export function formatTimestamp(date: Date | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Format time elapsed (e.g., "3 min ago")
export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Convert underscore_key to Title Case
export function snakeToTitle(str: string): string {
  return str.split('_').map(capitalize).join(' ');
}

// Calculate response percentage
export function calcResponseRate(responded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((responded / total) * 100);
}

// Truncate long text
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Get initials from display name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0).toUpperCase())
    .join('');
}

// Build a secure responder link
export function buildResponderLink(incidentId: string, baseUrl: string): string {
  return `${baseUrl}/responder/incidents/${incidentId}/view`;
}
