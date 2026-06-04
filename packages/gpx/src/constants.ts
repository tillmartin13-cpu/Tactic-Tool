export const TRACK_COLORS = [
  '#E63946',
  '#2196F3',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#FF5722',
  '#607D8B',
] as const;

export function trackColor(index: number): string {
  return TRACK_COLORS[index % TRACK_COLORS.length];
}
