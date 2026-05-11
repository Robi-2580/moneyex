import {
  Utensils, Car, ShoppingBag, FileText, Pill, BookOpen, Gamepad2, UtensilsCrossed,
  Users, ShoppingCart, Wifi, Smartphone, Wallet as WalletIcon, Laptop, TrendingUp,
  Gift, Banknote, Package, Music, Dumbbell, Palette, Wrench, Coffee, Plane, Home,
  Landmark, CreditCard, PiggyBank, Receipt, HeartPulse, GraduationCap, Film,
  Briefcase, DollarSign,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Maps both legacy emoji strings AND new icon-name strings to a Lucide icon
const MAP: Record<string, LucideIcon> = {
  // emojis (legacy data)
  '🍔': Utensils, '🍽️': UtensilsCrossed, '☕': Coffee,
  '🚗': Car, '✈️': Plane,
  '🛍️': ShoppingBag, '🛒': ShoppingCart,
  '📄': Receipt, '💊': Pill, '📚': BookOpen,
  '🎮': Gamepad2, '🎵': Music, '🎨': Palette, '🎬': Film,
  '👨‍👩‍👧': Users, '👥': Users,
  '📶': Wifi, '📱': Smartphone,
  '💰': WalletIcon, '💵': Banknote, '💴': Banknote, '💶': Banknote, '💷': Banknote,
  '💻': Laptop, '📈': TrendingUp, '📉': TrendingUp,
  '🎁': Gift, '📦': Package, '🏠': Home, '🏦': Landmark,
  '🏋️': Dumbbell, '🔧': Wrench, '💳': CreditCard, '🐷': PiggyBank,

  // new named icons
  food: Utensils, restaurant: UtensilsCrossed, coffee: Coffee,
  transport: Car, plane: Plane,
  shopping: ShoppingBag, groceries: ShoppingCart,
  bills: Receipt, health: HeartPulse, education: GraduationCap,
  entertainment: Gamepad2, music: Music, art: Palette, movie: Film,
  family: Users,
  wifi: Wifi, mobile: Smartphone,
  salary: WalletIcon, cash: Banknote, freelance: Laptop, investment: TrendingUp,
  gift: Gift, other: Package, home: Home, bank: Landmark,
  fitness: Dumbbell, tools: Wrench, card: CreditCard, savings: PiggyBank,
  work: Briefcase, money: DollarSign, wallet: WalletIcon,
};

export function resolveIcon(key?: string | null): LucideIcon {
  if (!key) return Package;
  return MAP[key] || Package;
}

interface CategoryIconProps {
  icon?: string | null;
  color?: string;
  size?: number;
  className?: string;
  bgOpacity?: number; // 0-100 for the bg tint
  bg?: boolean; // wrap in colored circle
  boxClassName?: string;
}

/** Renders a Lucide SVG for a category/wallet icon string (emoji or named). */
export function CategoryIcon({ icon, color, size = 18, className, bg = false, boxClassName }: CategoryIconProps) {
  const Icon = resolveIcon(icon);
  if (!bg) return <Icon size={size} className={className} style={color ? { color } : undefined} strokeWidth={2.2} />;
  return (
    <div
      className={boxClassName}
      style={{ backgroundColor: color ? color + '20' : 'hsl(var(--muted))', color }}
    >
      <Icon size={size} strokeWidth={2.2} />
    </div>
  );
}

export const ICON_OPTIONS: { key: string; label: string }[] = [
  { key: 'food', label: 'Food' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'transport', label: 'Transport' },
  { key: 'plane', label: 'Travel' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'bills', label: 'Bills' },
  { key: 'health', label: 'Health' },
  { key: 'education', label: 'Education' },
  { key: 'entertainment', label: 'Games' },
  { key: 'music', label: 'Music' },
  { key: 'movie', label: 'Movie' },
  { key: 'home', label: 'Home' },
  { key: 'family', label: 'Family' },
  { key: 'wifi', label: 'Wifi' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'salary', label: 'Salary' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'investment', label: 'Investment' },
  { key: 'gift', label: 'Gift' },
  { key: 'cash', label: 'Cash' },
  { key: 'bank', label: 'Bank' },
  { key: 'card', label: 'Card' },
  { key: 'savings', label: 'Savings' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'tools', label: 'Tools' },
  { key: 'art', label: 'Art' },
  { key: 'work', label: 'Work' },
  { key: 'other', label: 'Other' },
];
