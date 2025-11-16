/**
 * Optimize and deduplicate styles
 */

import { StyleObject } from '../../types';

export class StyleOptimizer {
  private styleCache: Map<string, string> = new Map();
  private styleCounter = 0;

  /**
   * Deduplicate styles and return style name
   */
  optimizeStyle(style: StyleObject): string {
    const styleKey = this.generateStyleKey(style);

    if (this.styleCache.has(styleKey)) {
      return this.styleCache.get(styleKey)!;
    }

    const styleName = `style${this.styleCounter++}`;
    this.styleCache.set(styleKey, styleName);

    return styleName;
  }

  /**
   * Generate a unique key for a style object
   */
  private generateStyleKey(style: StyleObject): string {
    return JSON.stringify(this.flattenStyles(style));
  }

  /**
   * Flatten style object
   */
  private flattenStyles(styleObject: StyleObject): any {
    const flat: any = {};

    if (styleObject.layout) {
      Object.assign(flat, styleObject.layout);
    }

    if (styleObject.visual) {
      Object.assign(flat, styleObject.visual);
    }

    if (styleObject.text) {
      Object.assign(flat, styleObject.text);
    }

    return flat;
  }

  /**
   * Get all unique styles
   */
  getStyles(): Map<string, StyleObject> {
    const styles = new Map<string, StyleObject>();

    // Reverse the cache to get style objects
    this.styleCache.forEach((name, key) => {
      try {
        const styleObj = JSON.parse(key);
        styles.set(name, styleObj);
      } catch (e) {
        // Skip invalid entries
      }
    });

    return styles;
  }

  /**
   * Reset optimizer state
   */
  reset(): void {
    this.styleCache.clear();
    this.styleCounter = 0;
  }

  /**
   * Merge similar styles with threshold
   */
  mergeSimilarStyles(threshold: number = 0.8): void {
    // Future enhancement: merge styles that are X% similar
    // This would further reduce style duplication
  }

  /**
   * Extract common styles into reusable constants
   */
  extractCommonStyles(styles: Record<string, any>): {
    common: Record<string, any>;
    specific: Record<string, any>;
  } {
    const common: Record<string, any> = {};
    const specific: Record<string, any> = {};

    // Count property occurrences
    const propertyCount: Record<string, number> = {};

    Object.values(styles).forEach((style: any) => {
      Object.keys(style).forEach(prop => {
        propertyCount[prop] = (propertyCount[prop] || 0) + 1;
      });
    });

    // If a property appears in >50% of styles, consider it common
    const totalStyles = Object.keys(styles).length;
    const threshold = totalStyles * 0.5;

    Object.entries(propertyCount).forEach(([prop, count]) => {
      if (count > threshold) {
        // Find most common value for this property
        const values: Record<string, number> = {};

        Object.values(styles).forEach((style: any) => {
          if (style[prop]) {
            const val = JSON.stringify(style[prop]);
            values[val] = (values[val] || 0) + 1;
          }
        });

        const mostCommon = Object.entries(values)
          .sort(([, a], [, b]) => b - a)[0];

        if (mostCommon) {
          common[prop] = JSON.parse(mostCommon[0]);
        }
      }
    });

    // Build specific styles (excluding common properties)
    Object.entries(styles).forEach(([name, style]) => {
      const specificStyle: any = {};

      Object.entries(style).forEach(([prop, value]) => {
        if (!common[prop] || JSON.stringify(common[prop]) !== JSON.stringify(value)) {
          specificStyle[prop] = value;
        }
      });

      if (Object.keys(specificStyle).length > 0) {
        specific[name] = specificStyle;
      }
    });

    return { common, specific };
  }
}
