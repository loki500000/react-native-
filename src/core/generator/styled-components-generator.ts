/**
 * Generate React Native code with styled-components
 */

import { ComponentNode, GeneratedComponent, StyleObject } from '../../types';

export class StyledComponentsGenerator {
  private styledComponents: Map<string, string> = new Map();

  /**
   * Generate React Native component code with styled-components
   */
  generate(node: ComponentNode, typescript: boolean = true): GeneratedComponent {
    this.styledComponents.clear();

    const imports = this.generateImports();
    const styledComponentsCode = this.generateStyledComponents(node);
    const componentCode = this.generateComponent(node, typescript);

    const code = `${imports}\n\n${styledComponentsCode}\n\n${componentCode}`;

    return {
      name: node.componentName || node.name,
      code,
      imports: ['react', 'styled-components/native'],
      exports: [node.componentName || node.name],
      assets: [],
    };
  }

  /**
   * Generate imports
   */
  private generateImports(): string {
    return `import React from 'react';
import styled from 'styled-components/native';`;
  }

  /**
   * Generate all styled components
   */
  private generateStyledComponents(node: ComponentNode): string {
    this.collectStyledComponents(node);

    const components: string[] = [];

    this.styledComponents.forEach((styles, name) => {
      components.push(`const ${name} = styled.View\`
${styles}
\`;`);
    });

    return components.join('\n\n');
  }

  /**
   * Collect all styled components needed
   */
  private collectStyledComponents(node: ComponentNode, depth: number = 0): void {
    if (!node.isComponent || depth === 0) {
      const styledName = this.getStyledComponentName(node);
      const styles = this.convertStylesToCSS(node.styles, node.type);

      this.styledComponents.set(styledName, styles);

      node.children.forEach(child => {
        this.collectStyledComponents(child, depth + 1);
      });
    }
  }

  /**
   * Generate component code
   */
  private generateComponent(node: ComponentNode, typescript: boolean): string {
    const componentName = node.componentName || node.name;
    const propsType = typescript ? ': React.FC' : '';

    const jsx = this.generateJSX(node);

    return `export const ${componentName}${propsType} = () => {
  return (
    ${jsx}
  );
};`;
  }

  /**
   * Generate JSX for a node
   */
  private generateJSX(node: ComponentNode, depth: number = 0): string {
    const styledName = this.getStyledComponentName(node);

    // Handle text nodes
    if (node.type === 'Text') {
      const textContent = node.props.characters || 'Text';
      return `<${styledName}>${textContent}</${styledName}>`;
    }

    // Handle components (instances)
    if (node.isComponent && node.componentName && depth > 0) {
      return `<${node.componentName} />`;
    }

    // Handle container nodes with children
    if (node.children.length > 0) {
      const childrenJSX = node.children
        .map(child => this.generateJSX(child, depth + 1))
        .join('\n      ');

      return `<${styledName}>
      ${childrenJSX}
    </${styledName}>`;
    }

    // Empty nodes
    return `<${styledName} />`;
  }

  /**
   * Get styled component name for a node
   */
  private getStyledComponentName(node: ComponentNode): string {
    const baseName = node.name.charAt(0).toUpperCase() + node.name.slice(1);
    return `Styled${baseName}`;
  }

  /**
   * Convert React Native styles to CSS-in-JS
   */
  private convertStylesToCSS(styleObject: StyleObject, nodeType: string): string {
    const cssLines: string[] = [];

    const flatStyle = this.flattenStyles(styleObject);

    Object.entries(flatStyle).forEach(([key, value]) => {
      const cssProperty = this.camelToKebab(key);
      const cssValue = this.formatCSSValue(key, value);

      cssLines.push(`  ${cssProperty}: ${cssValue};`);
    });

    return cssLines.join('\n');
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
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Format CSS value
   */
  private formatCSSValue(key: string, value: any): string {
    if (typeof value === 'number') {
      // Properties that need 'px' suffix
      const pxProperties = [
        'width', 'height', 'fontSize', 'lineHeight',
        'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'borderRadius', 'borderWidth', 'gap', 'letterSpacing',
        'top', 'right', 'bottom', 'left'
      ];

      if (pxProperties.includes(key)) {
        return `${value}px`;
      }

      return value.toString();
    }

    if (typeof value === 'string') {
      return value;
    }

    return String(value);
  }
}
