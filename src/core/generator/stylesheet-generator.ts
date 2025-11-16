/**
 * Generate React Native code with StyleSheet
 */

import { ComponentNode, GeneratedComponent, StyleObject } from '../../types';

export class StyleSheetGenerator {
  private styleCounter = 0;
  private styles: Record<string, any> = {};

  /**
   * Generate React Native component code with StyleSheet
   */
  generate(node: ComponentNode, typescript: boolean = true): GeneratedComponent {
    this.styleCounter = 0;
    this.styles = {};

    const imports = this.generateImports(node);
    const componentCode = this.generateComponent(node, typescript);
    const stylesCode = this.generateStyles();

    const code = `${imports}\n\n${componentCode}\n\n${stylesCode}`;

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
import { ${reactNativeImports}, StyleSheet } from 'react-native';`;
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
   * Generate JSX for a node
   */
  private generateJSX(node: ComponentNode, depth: number = 0): string {
    const styleName = this.addStyle(node.styles);
    const componentType = node.type;

    // Handle text nodes
    if (componentType === 'Text') {
      const textContent = node.props.characters || 'Text';
      return `<${componentType} style={styles.${styleName}}>${textContent}</${componentType}>`;
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

      return `<${componentType} style={styles.${styleName}}>
${childrenJSX}
</${componentType}>`;
    }

    // Empty nodes
    return `<${componentType} style={styles.${styleName}} />`;
  }

  /**
   * Add style to styles object and return its name
   */
  private addStyle(styleObject: StyleObject): string {
    const styleName = `style${this.styleCounter++}`;
    const flatStyle = this.flattenStyles(styleObject);

    this.styles[styleName] = flatStyle;

    return styleName;
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
   * Generate StyleSheet code
   */
  private generateStyles(): string {
    const stylesJson = JSON.stringify(this.styles, null, 2)
      .replace(/"([^"]+)":/g, '$1:'); // Remove quotes from keys

    return `const styles = StyleSheet.create(${stylesJson});`;
  }

  /**
   * Indent code
   */
  private indent(code: string, level: number): string {
    const spaces = '  '.repeat(level);
    return code.split('\n').map(line => spaces + line).join('\n');
  }
}
