export type FoodTimingId =
  | 'with_food'
  | 'after_food'
  | 'before_food'
  | 'after_breakfast'
  | 'after_lunch'
  | 'after_dinner'
  | 'with_milk'
  | 'with_water'
  | 'at_bedtime'
  | 'any_time';

export const FOOD_TID: readonly FoodTimingId[] = [
  'with_food',
  'after_food',
  'before_food',
  'after_breakfast',
  'after_lunch',
  'after_dinner',
  'with_milk',
  'with_water',
  'at_bedtime',
  'any_time',
];

export const FOOD_LABELS: readonly string[] = [
  'With Food',
  'After Food',
  'Before Food / Empty Stomach',
  'After Breakfast',
  'After Lunch',
  'After Dinner',
  'With Milk',
  'With Water',
  'At Bedtime',
  'Any Time',
];

export const FOOD_ICONS: readonly string[] = [
  '🍽️',
  '⏰',
  '💊',
  '🍳',
  '🌞',
  '🌙',
  '🥛',
  '💧',
  '😴',
  '⭕',
];

export function foodLabel(id: FoodTimingId | null | undefined): string {
  if (!id) return 'Any Time';
  const i = FOOD_TID.indexOf(id);
  return i >= 0 ? FOOD_LABELS[i] : 'Any Time';
}

export function foodIcon(id: FoodTimingId | null | undefined): string {
  if (!id) return '⭕';
  const i = FOOD_TID.indexOf(id);
  return i >= 0 ? FOOD_ICONS[i] : '⭕';
}
