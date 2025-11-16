/**
 * Color conversion utilities
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Convert Figma color (0-1 range) to hex string
 */
export function rgbaToHex(color: RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');

  if (color.a < 1) {
    const a = Math.round(color.a * 255);
    return `#${hex}${a.toString(16).padStart(2, '0')}`;
  }

  return `#${hex}`;
}

/**
 * Convert Figma color to rgba string
 */
export function rgbaToString(color: RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  if (color.a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Check if a color is light or dark
 */
export function isLightColor(color: RGBA): boolean {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance > 0.5;
}

/**
 * Generate a readable color name
 */
export function generateColorName(color: RGBA): string {
  const hex = rgbaToHex(color).replace('#', '');
  return `color_${hex}`;
}
