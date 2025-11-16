# Figma to React Native Code Generator

A comprehensive tool to convert Figma designs into production-ready React Native code. Supports both CLI and Figma Plugin interfaces.

## Features

- **Multiple Interfaces**: CLI tool and Figma Plugin
- **Smart Component Generation**: Automatically recognizes and generates React Native components
- **Auto Layout Support**: Converts Figma Auto Layout to responsive Flexbox
- **Design Tokens**: Extracts colors, typography, and spacing as design tokens
- **Multiple Styling Options**: StyleSheet, styled-components, or inline styles
- **Asset Export**: Handles images, icons, and SVG exports
- **TypeScript Support**: Full TypeScript definitions and type-safe generation
- **Component Configuration**: Customize component names, props, and behavior

## Installation

### CLI Tool

```bash
npm install -g figma-to-react-native
```

### Figma Plugin

Install from Figma Community or build locally:

```bash
npm install
npm run build:plugin
```

## Usage

### CLI

```bash
# Set your Figma API token
export FIGMA_TOKEN="your-figma-personal-access-token"

# Generate code from a Figma file
figma-rn generate <file-id> --output ./output

# Generate with specific styling
figma-rn generate <file-id> --style stylesheet --output ./components

# Extract design tokens only
figma-rn tokens <file-id> --output ./tokens.json
```

### Figma Plugin

1. Open your Figma file
2. Go to Plugins → Development → Figma to React Native
3. Select the layers you want to convert
4. Click "Generate Code"
5. Copy the generated React Native code

## Configuration

Create a `figma-rn.config.json` in your project root:

```json
{
  "styleType": "stylesheet",
  "typescript": true,
  "componentPrefix": "",
  "extractAssets": true,
  "responsive": true,
  "designTokens": true
}
```

## Architecture

This generator analyzes the 5 best Figma to React Native repositories and combines their strengths:

1. **onome3d/Fig-Native** - Simple component mapping
2. **Curebase/figma-to-react-native** - Auto Layout responsive styles
3. **erisvaldojunior/figma-to-react-native** - Component configuration
4. **kat-tax/figma-to-react-native** - Design tokens & theming
5. **kazuyaseki/figma-to-react** - Abstract intermediate representation

### How It Works

```
Figma Design
    ↓
Figma API / Plugin API
    ↓
Node Parser (Abstract Syntax Tree)
    ↓
Transformer (Component Recognition, Layout Calculation)
    ↓
Generator (React Native Code)
    ↓
Output (Components + Styles + Assets)
```

## Examples

See the `examples/` directory for generated code samples.

## Development

```bash
# Install dependencies
npm install

# Build CLI
npm run build:cli

# Build plugin
npm run build:plugin

# Run tests
npm test

# Development mode
npm run dev
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
