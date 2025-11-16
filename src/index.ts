/**
 * Figma to React Native Code Generator
 * Main library exports
 */

// Core converter
export { FigmaConverter } from './core/converter';

// Parsers
export { NodeParser } from './core/parser/node-parser';
export { TokenExtractor } from './core/parser/token-extractor';

// Generators
export { StyleSheetGenerator } from './core/generator/stylesheet-generator';
export { StyledComponentsGenerator } from './core/generator/styled-components-generator';
export { InlineGenerator } from './core/generator/inline-generator';

// Detector & Optimizer
export { ComponentDetector } from './core/detector/component-detector';
export { StyleOptimizer } from './core/optimizer/style-optimizer';

// Asset extraction
export { AssetExtractor } from './core/asset/asset-extractor';

// Validation
export { NodeValidator } from './core/validator/node-validator';

// Utilities
export { FigmaAPI } from './utils/figma-api';
export * from './utils/color';

// Types
export * from './types';
