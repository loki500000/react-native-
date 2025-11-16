/**
 * Figma node parser - converts Figma nodes to abstract component nodes
 */

import { ComponentNode, StyleObject, LayoutStyles, VisualStyles, TextStyles } from '../../types';
import { rgbaToHex, RGBA } from '../../utils/color';

export class NodeParser {
  /**
   * Parse a Figma node into our abstract ComponentNode format
   */
  parse(node: any): ComponentNode {
    const componentNode: ComponentNode = {
      id: node.id,
      name: this.sanitizeName(node.name),
      type: this.mapNodeType(node.type),
      children: [],
      props: {},
      styles: this.parseStyles(node),
      isComponent: this.isComponentNode(node),
    };

    // Parse children recursively
    if (node.children && Array.isArray(node.children)) {
      componentNode.children = node.children.map((child: any) => this.parse(child));
    }

    // Set component name if it's a component
    if (componentNode.isComponent) {
      componentNode.componentName = this.generateComponentName(node.name);
    }

    return componentNode;
  }

  /**
   * Check if a node should be treated as a separate component
   */
  private isComponentNode(node: any): boolean {
    // Figma components
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      return true;
    }

    // Instances of components
    if (node.type === 'INSTANCE') {
      return true;
    }

    // Frames with specific naming convention (e.g., Button, Card, Header)
    if (node.type === 'FRAME' && /^[A-Z]/.test(node.name)) {
      return true;
    }

    return false;
  }

  /**
   * Parse all styles from a Figma node
   */
  private parseStyles(node: any): StyleObject {
    return {
      layout: this.parseLayoutStyles(node),
      visual: this.parseVisualStyles(node),
      text: this.parseTextStyles(node),
    };
  }

  /**
   * Parse layout styles (Flexbox, sizing, spacing)
   */
  private parseLayoutStyles(node: any): LayoutStyles | undefined {
    const styles: LayoutStyles = {};

    // Size
    if (node.absoluteBoundingBox) {
      styles.width = node.absoluteBoundingBox.width;
      styles.height = node.absoluteBoundingBox.height;
    }

    // Auto Layout (Flexbox)
    if (node.layoutMode) {
      styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

      // Primary axis alignment
      if (node.primaryAxisAlignItems) {
        styles.justifyContent = this.mapAlignment(node.primaryAxisAlignItems);
      }

      // Counter axis alignment
      if (node.counterAxisAlignItems) {
        styles.alignItems = this.mapCounterAlignment(node.counterAxisAlignItems);
      }

      // Gap
      if (node.itemSpacing !== undefined) {
        styles.gap = node.itemSpacing;
      }
    }

    // Padding
    if (node.paddingLeft !== undefined || node.paddingRight !== undefined ||
        node.paddingTop !== undefined || node.paddingBottom !== undefined) {

      const pl = node.paddingLeft || 0;
      const pr = node.paddingRight || 0;
      const pt = node.paddingTop || 0;
      const pb = node.paddingBottom || 0;

      if (pl === pr && pt === pb && pl === pt) {
        styles.padding = pl;
      } else {
        if (pt) styles.paddingTop = pt;
        if (pr) styles.paddingRight = pr;
        if (pb) styles.paddingBottom = pb;
        if (pl) styles.paddingLeft = pl;
      }
    }

    // Position
    if (node.constraints) {
      // Absolute positioning
      if (node.constraints.horizontal === 'SCALE' || node.constraints.vertical === 'SCALE') {
        styles.position = 'absolute';
      }
    }

    // Layout grow/shrink
    if (node.layoutGrow !== undefined && node.layoutGrow > 0) {
      styles.flexGrow = node.layoutGrow;
    }

    return Object.keys(styles).length > 0 ? styles : undefined;
  }

  /**
   * Parse visual styles (colors, borders, effects)
   */
  private parseVisualStyles(node: any): VisualStyles | undefined {
    const styles: VisualStyles = {};

    // Background color
    if (node.backgroundColor) {
      styles.backgroundColor = rgbaToHex(node.backgroundColor as RGBA);
    } else if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.visible !== false) {
        styles.backgroundColor = rgbaToHex(fill.color as RGBA);
      }
    }

    // Border radius
    if (node.cornerRadius !== undefined) {
      styles.borderRadius = node.cornerRadius;
    } else if (node.rectangleCornerRadii) {
      const [tl, tr, br, bl] = node.rectangleCornerRadii;
      if (tl === tr && tr === br && br === bl) {
        styles.borderRadius = tl;
      } else {
        styles.borderTopLeftRadius = tl;
        styles.borderTopRightRadius = tr;
        styles.borderBottomRightRadius = br;
        styles.borderBottomLeftRadius = bl;
      }
    }

    // Strokes (borders)
    if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.visible !== false) {
        styles.borderColor = rgbaToHex(stroke.color as RGBA);
        styles.borderWidth = node.strokeWeight || 1;
      }
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity < 1) {
      styles.opacity = node.opacity;
    }

    // Overflow
    if (node.clipsContent) {
      styles.overflow = 'hidden';
    }

    return Object.keys(styles).length > 0 ? styles : undefined;
  }

  /**
   * Parse text styles
   */
  private parseTextStyles(node: any): TextStyles | undefined {
    if (node.type !== 'TEXT') {
      return undefined;
    }

    const styles: TextStyles = {};

    if (node.style) {
      if (node.style.fontFamily) {
        styles.fontFamily = node.style.fontFamily;
      }
      if (node.style.fontSize) {
        styles.fontSize = node.style.fontSize;
      }
      if (node.style.fontWeight) {
        styles.fontWeight = node.style.fontWeight.toString();
      }
      if (node.style.lineHeightPx) {
        styles.lineHeight = node.style.lineHeightPx;
      }
      if (node.style.letterSpacing) {
        styles.letterSpacing = node.style.letterSpacing;
      }
      if (node.style.textAlignHorizontal) {
        styles.textAlign = node.style.textAlignHorizontal.toLowerCase() as any;
      }
    }

    // Text color
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.visible !== false) {
        styles.color = rgbaToHex(fill.color as RGBA);
      }
    }

    return Object.keys(styles).length > 0 ? styles : undefined;
  }

  /**
   * Map Figma alignment to Flexbox justifyContent
   */
  private mapAlignment(alignment: string): any {
    const map: Record<string, any> = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'SPACE_BETWEEN': 'space-between',
    };
    return map[alignment] || 'flex-start';
  }

  /**
   * Map Figma counter alignment to Flexbox alignItems
   */
  private mapCounterAlignment(alignment: string): any {
    const map: Record<string, any> = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'BASELINE': 'baseline',
    };
    return map[alignment] || 'flex-start';
  }

  /**
   * Map Figma node type to React Native component type
   */
  private mapNodeType(type: string): string {
    const map: Record<string, string> = {
      'FRAME': 'View',
      'GROUP': 'View',
      'RECTANGLE': 'View',
      'TEXT': 'Text',
      'INSTANCE': 'Component',
      'COMPONENT': 'Component',
      'COMPONENT_SET': 'Component',
      'VECTOR': 'Image',
      'BOOLEAN_OPERATION': 'View',
      'STAR': 'View',
      'LINE': 'View',
      'ELLIPSE': 'View',
    };
    return map[type] || 'View';
  }

  /**
   * Sanitize node name for use in code
   */
  private sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Generate a valid React component name
   */
  private generateComponentName(name: string): string {
    // Remove special characters
    let componentName = name.replace(/[^a-zA-Z0-9\s]/g, '');

    // Convert to PascalCase
    componentName = componentName
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Ensure it starts with a capital letter
    if (!/^[A-Z]/.test(componentName)) {
      componentName = 'Component' + componentName;
    }

    return componentName;
  }
}
