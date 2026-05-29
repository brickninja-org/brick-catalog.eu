export type FormatWeightUnit = 'auto' | 'g' | 'kg' | 'lb' | 'oz';

export const GRAMS_PER_KILOGRAM = 1000;
export const GRAMS_PER_POUND = 453.59237;
export const GRAMS_PER_OUNCE = 28.349523125;
const SMALL_OUNCE_THRESHOLD = 0.1;
const SMALL_OUNCE_THRESHOLD_IN_GRAMS = GRAMS_PER_OUNCE * SMALL_OUNCE_THRESHOLD;

// Boundary policy:
// - US/GB: < 0.1 oz => g, > 1 lb => lb, otherwise oz.
// - Other regions: > 1 kg => kg, otherwise g.
// Exact 0.1 oz / 1 lb / 1 kg keep the smaller unit branch.
export function resolveAutoWeightUnit(weightInGrams: number, region: string): Exclude<FormatWeightUnit, 'auto'> {
  if (region === 'US' || region === 'GB') {
    if (weightInGrams < SMALL_OUNCE_THRESHOLD_IN_GRAMS) {
      return 'g';
    }

    return weightInGrams > GRAMS_PER_POUND ? 'lb' : 'oz';
  }

  return weightInGrams > GRAMS_PER_KILOGRAM ? 'kg' : 'g';
}

export function getWeightDisplay(weightInGrams: number, unit: Exclude<FormatWeightUnit, 'auto'>) {
  switch (unit) {
    case 'g':
      return { value: weightInGrams, intlUnit: 'gram' as const, maximumFractionDigits: 3 };
    case 'kg':
      return { value: weightInGrams / GRAMS_PER_KILOGRAM, intlUnit: 'kilogram' as const, maximumFractionDigits: 2 };
    case 'oz':
      return { value: weightInGrams / GRAMS_PER_OUNCE, intlUnit: 'ounce' as const, maximumFractionDigits: 3 };
    case 'lb':
    default:
      return { value: weightInGrams / GRAMS_PER_POUND, intlUnit: 'pound' as const, maximumFractionDigits: 2 };
  }
}
