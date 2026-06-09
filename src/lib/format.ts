import type { Language } from '@/types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export interface FormatNumberOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number based on the active language.
 * - Bengali (`bn`): Indian grouping + Bengali numerals.
 * - English (`en`): standard `en-IN` grouping with Latin digits.
 * No currency symbol is rendered.
 */
export function formatNumber(
  value: number,
  language: Language,
  opts: FormatNumberOptions = {}
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const base = value.toLocaleString('en-IN', opts);
  return language === 'bn' ? toBnDigits(base) : base;
}
