/**
 * Extract design tokens from Figma files
 */

import { DesignTokens, TypographyToken, ShadowToken } from '../../types';
import { rgbaToHex, RGBA, generateColorName } from '../../utils/color';

export class TokenExtractor {
  /**
   * Extract all design tokens from a Figma file
   */
  extractTokens(figmaFile: any): DesignTokens {
    const tokens: DesignTokens = {
      colors: {},
      typography: [],
      spacing: {},
      borderRadius: {},
      shadows: [],
    };

    // Extract from document
    if (figmaFile.document) {
      this.traverseNode(figmaFile.document, tokens);
    }

    // Extract from styles if available
    if (figmaFile.styles) {
      this.extractFromStyles(figmaFile.styles, tokens);
    }

    return tokens;
  }

  /**
   * Traverse Figma node tree to extract tokens
   */
  private traverseNode(node: any, tokens: DesignTokens): void {
    // Extract colors
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const colorHex = rgbaToHex(fill.color as RGBA);
          const colorName = node.name ? this.sanitizeName(node.name) : generateColorName(fill.color);
          if (!tokens.colors[colorName]) {
            tokens.colors[colorName] = colorHex;
          }
        }
      });
    }

    // Extract background colors
    if (node.backgroundColor) {
      const colorHex = rgbaToHex(node.backgroundColor as RGBA);
      const colorName = node.name ? this.sanitizeName(node.name) + '_bg' : generateColorName(node.backgroundColor);
      if (!tokens.colors[colorName]) {
        tokens.colors[colorName] = colorHex;
      }
    }

    // Extract typography
    if (node.type === 'TEXT' && node.style) {
      const typographyToken: TypographyToken = {
        name: this.sanitizeName(node.name),
        fontFamily: node.style.fontFamily || 'System',
        fontSize: node.style.fontSize || 14,
        fontWeight: node.style.fontWeight?.toString() || '400',
        lineHeight: node.style.lineHeightPx || node.style.fontSize || 14,
        letterSpacing: node.style.letterSpacing || 0,
      };

      // Check if not duplicate
      if (!tokens.typography.some(t =>
        t.fontFamily === typographyToken.fontFamily &&
        t.fontSize === typographyToken.fontSize &&
        t.fontWeight === typographyToken.fontWeight
      )) {
        tokens.typography.push(typographyToken);
      }
    }

    // Extract spacing (from padding)
    if (node.paddingLeft !== undefined) {
      const spacingName = `spacing_${node.paddingLeft}`;
      tokens.spacing[spacingName] = node.paddingLeft;
    }

    // Extract border radius
    if (node.cornerRadius !== undefined) {
      const radiusName = `radius_${node.cornerRadius}`;
      tokens.borderRadius[radiusName] = node.cornerRadius;
    }

    // Extract shadows (effects)
    if (node.effects && Array.isArray(node.effects)) {
      node.effects.forEach((effect: any) => {
        if (effect.type === 'DROP_SHADOW' && effect.visible !== false) {
          const shadowToken: ShadowToken = {
            name: this.sanitizeName(node.name) + '_shadow',
            shadowColor: rgbaToHex(effect.color as RGBA),
            shadowOffset: {
              width: effect.offset?.x || 0,
              height: effect.offset?.y || 0,
            },
            shadowOpacity: effect.color?.a || 1,
            shadowRadius: effect.radius || 0,
            elevation: Math.round(effect.radius || 0), // For Android
          };

          // Check if not duplicate
          if (!tokens.shadows.some(s =>
            s.shadowColor === shadowToken.shadowColor &&
            s.shadowRadius === shadowToken.shadowRadius
          )) {
            tokens.shadows.push(shadowToken);
          }
        }
      });
    }

    // Recursively traverse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => this.traverseNode(child, tokens));
    }
  }

  /**
   * Extract tokens from Figma styles
   */
  private extractFromStyles(styles: any, tokens: DesignTokens): void {
    if (!styles) return;

    Object.entries(styles).forEach(([key, style]: [string, any]) => {
      if (style.styleType === 'FILL' && style.style) {
        // Color styles
        if (style.style.color) {
          const colorHex = rgbaToHex(style.style.color as RGBA);
          tokens.colors[this.sanitizeName(style.name)] = colorHex;
        }
      } else if (style.styleType === 'TEXT' && style.style) {
        // Typography styles
        const typographyToken: TypographyToken = {
          name: this.sanitizeName(style.name),
          fontFamily: style.style.fontFamily || 'System',
          fontSize: style.style.fontSize || 14,
          fontWeight: style.style.fontWeight?.toString() || '400',
          lineHeight: style.style.lineHeightPx || style.style.fontSize || 14,
          letterSpacing: style.style.letterSpacing || 0,
        };

        if (!tokens.typography.some(t => t.name === typographyToken.name)) {
          tokens.typography.push(typographyToken);
        }
      }
    });
  }

  /**
   * Sanitize name for use as a token identifier
   */
  private sanitizeName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Generate tokens file content
   */
  generateTokensFile(tokens: DesignTokens, format: 'ts' | 'json' = 'ts'): string {
    if (format === 'json') {
      return JSON.stringify(tokens, null, 2);
    }

    // TypeScript format
    return `/**
 * Design Tokens extracted from Figma
 * Auto-generated - do not modify manually
 */

export const colors = ${JSON.stringify(tokens.colors, null, 2)};

export const typography = ${JSON.stringify(tokens.typography, null, 2)};

export const spacing = ${JSON.stringify(tokens.spacing, null, 2)};

export const borderRadius = ${JSON.stringify(tokens.borderRadius, null, 2)};

export const shadows = ${JSON.stringify(tokens.shadows, null, 2)};

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default designTokens;
`;
  }
}
