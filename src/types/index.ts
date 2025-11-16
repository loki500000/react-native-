/**
 * Core type definitions for Figma to React Native converter
 */

export type StyleType = 'stylesheet' | 'styled-components' | 'inline';

export interface GeneratorConfig {
  styleType: StyleType;
  typescript: boolean;
  componentPrefix: string;
  extractAssets: boolean;
  responsive: boolean;
  designTokens: boolean;
  outputPath: string;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: TypographyToken[];
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  shadows: ShadowToken[];
}

export interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface ShadowToken {
  name: string;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ComponentNode {
  id: string;
  name: string;
  type: string;
  children: ComponentNode[];
  props: Record<string, any>;
  styles: StyleObject;
  isComponent: boolean;
  componentName?: string;
}

export interface StyleObject {
  layout?: LayoutStyles;
  visual?: VisualStyles;
  text?: TextStyles;
}

export interface LayoutStyles {
  width?: number | string;
  height?: number | string;
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  gap?: number;
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  position?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface VisualStyles {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
}

export interface TextStyles {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecorationLine?: 'none' | 'underline' | 'line-through';
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'svg' | 'icon';
  url: string;
  localPath?: string;
}

export interface GeneratedComponent {
  name: string;
  code: string;
  imports: string[];
  exports: string[];
  assets: Asset[];
}

export interface GeneratorOutput {
  components: GeneratedComponent[];
  designTokens?: DesignTokens;
  assets: Asset[];
  index?: string;
}
