/**
 * Generate React Native code with inline styles
 */

import { ComponentNode, GeneratedComponent, StyleObject } from '../../types';

export class InlineGenerator {
  /**
   * Generate React Native component code with inline styles
   */
  generate(node: ComponentNode, typescript: boolean = true): GeneratedComponent {
    const imports = this.generateImports(node);
    const componentCode = this.generateComponent(node, typescript);

    const code = `${imports}\n\n${componentCode}`;

    return {
      name: node.componentName || node.name,
      code,
      imports: ['react', 'react-native'],
      exports: [node.componentName || node.name],
      assets: [],
    };
  }

  /**
   * Generate imports
   */
  private generateImports(node: ComponentNode): string {
    const components = new Set<string>();
    this.collectComponents(node, components);

    const reactNativeImports = Array.from(components).join(', ');

    return `import React from 'react';
import { ${reactNativeImports} } from 'react-native';`;
  }

  /**
   * Collect all React Native components used
   */
  private collectComponents(node: ComponentNode, components: Set<string>): void {
    components.add(node.type);

    node.children.forEach(child => {
      if (!child.isComponent) {
        this.collectComponents(child, components);
      }
    });
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
${this.indent(jsx, 2)}
  );
};`;
  }

  /**
   * Generate JSX for a node with inline styles
   */
  private generateJSX(node: ComponentNode, depth: number = 0): string {
    const inlineStyle = this.generateInlineStyle(node.styles);
    const componentType = node.type;

    // Handle text nodes
    if (componentType === 'Text') {
      const textContent = node.props.characters || 'Text';
      return `<${componentType} style={${inlineStyle}}>${textContent}</${componentType}>`;
    }

    // Handle components (instances)
    if (node.isComponent && node.componentName && depth > 0) {
      return `<${node.componentName} />`;
    }

    // Handle container nodes with children
    if (node.children.length > 0) {
      const childrenJSX = node.children
        .map(child => this.indent(this.generateJSX(child, depth + 1), 1))
        .join('\n');

      return `<${componentType} style={${inlineStyle}}>
${childrenJSX}
</${componentType}>`;
    }

    // Empty nodes
    return `<${componentType} style={${inlineStyle}} />`;
  }

  /**
   * Generate inline style object
   */
  private generateInlineStyle(styleObject: StyleObject): string {
    const flatStyle = this.flattenStyles(styleObject);

    if (Object.keys(flatStyle).length === 0) {
      return '{}';
    }

    // Convert to inline object notation
    const styleEntries = Object.entries(flatStyle).map(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value;
      return `${key}: ${formattedValue}`;
    });

    return `{ ${styleEntries.join(', ')} }`;
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
   * Indent code
   */
  private indent(code: string, level: number): string {
    const spaces = '  '.repeat(level);
    return code.split('\n').map(line => spaces + line).join('\n');
  }
}
