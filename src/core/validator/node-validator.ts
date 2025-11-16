/**
 * Validate Figma nodes and provide helpful error messages
 */

export class NodeValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validate a Figma node
   */
  validate(node: any): { valid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    this.validateNode(node);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate a single node
   */
  private validateNode(node: any, path: string = 'root'): void {
    if (!node) {
      this.errors.push(`${path}: Node is null or undefined`);
      return;
    }

    // Check required properties
    if (!node.type) {
      this.errors.push(`${path}: Missing 'type' property`);
    }

    if (!node.name) {
      this.warnings.push(`${path}: Missing 'name' property`);
    }

    // Validate node type
    const validTypes = [
      'DOCUMENT', 'CANVAS', 'FRAME', 'GROUP', 'VECTOR', 'BOOLEAN_OPERATION',
      'STAR', 'LINE', 'ELLIPSE', 'REGULAR_POLYGON', 'RECTANGLE', 'TEXT',
      'SLICE', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE'
    ];

    if (node.type && !validTypes.includes(node.type)) {
      this.warnings.push(`${path}: Unknown node type '${node.type}'`);
    }

    // Validate text nodes
    if (node.type === 'TEXT') {
      if (!node.characters) {
        this.warnings.push(`${path}: Text node has no characters`);
      }

      if (!node.style) {
        this.warnings.push(`${path}: Text node missing style information`);
      }
    }

    // Validate layout
    if (node.layoutMode) {
      if (!['NONE', 'HORIZONTAL', 'VERTICAL'].includes(node.layoutMode)) {
        this.errors.push(`${path}: Invalid layoutMode '${node.layoutMode}'`);
      }
    }

    // Validate fills
    if (node.fills && !Array.isArray(node.fills)) {
      this.errors.push(`${path}: 'fills' must be an array`);
    }

    // Validate strokes
    if (node.strokes && !Array.isArray(node.strokes)) {
      this.errors.push(`${path}: 'strokes' must be an array`);
    }

    // Check for extremely large dimensions
    if (node.absoluteBoundingBox) {
      const { width, height } = node.absoluteBoundingBox;

      if (width > 10000 || height > 10000) {
        this.warnings.push(`${path}: Very large dimensions (${width}x${height})`);
      }

      if (width === 0 || height === 0) {
        this.warnings.push(`${path}: Zero dimension (${width}x${height})`);
      }
    }

    // Validate color values
    if (node.backgroundColor) {
      this.validateColor(node.backgroundColor, `${path}.backgroundColor`);
    }

    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill: any, i: number) => {
        if (fill.color) {
          this.validateColor(fill.color, `${path}.fills[${i}].color`);
        }
      });
    }

    // Check for problematic names
    if (node.name) {
      if (node.name.includes('/')) {
        this.warnings.push(`${path}: Name contains '/' which may cause issues: '${node.name}'`);
      }

      if (node.name.match(/^\d/)) {
        this.warnings.push(`${path}: Name starts with number: '${node.name}'`);
      }
    }

    // Recursively validate children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any, i: number) => {
        this.validateNode(child, `${path}.children[${i}]`);
      });
    }
  }

  /**
   * Validate color values
   */
  private validateColor(color: any, path: string): void {
    if (!color) return;

    const { r, g, b, a } = color;

    if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
      this.errors.push(`${path}: RGB values must be between 0 and 1`);
    }

    if (a !== undefined && (a < 0 || a > 1)) {
      this.errors.push(`${path}: Alpha value must be between 0 and 1`);
    }
  }

  /**
   * Validate entire file structure
   */
  validateFile(figmaFile: any): { valid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    if (!figmaFile) {
      this.errors.push('Figma file is null or undefined');
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }

    if (!figmaFile.document) {
      this.errors.push('Figma file missing document property');
    } else {
      this.validateNode(figmaFile.document, 'document');
    }

    if (!figmaFile.name) {
      this.warnings.push('Figma file missing name');
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}
