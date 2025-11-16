/**
 * Tests for color utilities
 */

import { rgbaToHex, rgbaToString, isLightColor, generateColorName } from '../color';

describe('Color Utilities', () => {
  describe('rgbaToHex', () => {
    it('should convert RGBA to hex', () => {
      const color = { r: 1, g: 0, b: 0, a: 1 };
      expect(rgbaToHex(color)).toBe('#ff0000');
    });

    it('should handle alpha channel', () => {
      const color = { r: 1, g: 0, b: 0, a: 0.5 };
      expect(rgbaToHex(color)).toBe('#ff000080');
    });

    it('should handle black', () => {
      const color = { r: 0, g: 0, b: 0, a: 1 };
      expect(rgbaToHex(color)).toBe('#000000');
    });

    it('should handle white', () => {
      const color = { r: 1, g: 1, b: 1, a: 1 };
      expect(rgbaToHex(color)).toBe('#ffffff');
    });
  });

  describe('rgbaToString', () => {
    it('should convert RGBA to rgb string', () => {
      const color = { r: 1, g: 0, b: 0, a: 1 };
      expect(rgbaToString(color)).toBe('rgb(255, 0, 0)');
    });

    it('should convert RGBA to rgba string with alpha', () => {
      const color = { r: 1, g: 0, b: 0, a: 0.5 };
      expect(rgbaToString(color)).toBe('rgba(255, 0, 0, 0.5)');
    });
  });

  describe('isLightColor', () => {
    it('should identify light colors', () => {
      const white = { r: 1, g: 1, b: 1, a: 1 };
      expect(isLightColor(white)).toBe(true);
    });

    it('should identify dark colors', () => {
      const black = { r: 0, g: 0, b: 0, a: 1 };
      expect(isLightColor(black)).toBe(false);
    });
  });

  describe('generateColorName', () => {
    it('should generate valid color names', () => {
      const color = { r: 1, g: 0, b: 0, a: 1 };
      const name = generateColorName(color);
      expect(name).toMatch(/^color_/);
      expect(name).toBe('color_ff0000');
    });
  });
});
