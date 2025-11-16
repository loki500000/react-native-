# Figma to React Native Code Generator

[![CI](https://github.com/your-repo/figma-to-react-native/workflows/CI/badge.svg)](https://github.com/your-repo/figma-to-react-native/actions)
[![npm version](https://badge.fury.io/js/figma-to-react-native.svg)](https://www.npmjs.com/package/figma-to-react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready tool to convert Figma designs into React Native code. Built by analyzing and combining the best features from 5 leading Figma-to-code repositories.

**✅ 100% Expo Compatible** - All generated code works perfectly with Expo (no native modules, no ejecting needed). See [EXPO_COMPATIBILITY.md](./EXPO_COMPATIBILITY.md) for details.

---

## 🚀 Two Ways to Use This Project

### 1. **CLI Tool** (This README) - For direct code generation
Use the standalone CLI to convert Figma designs to React Native code. Perfect for:
- Quick conversions
- CI/CD pipelines
- Existing projects

### 2. **Full IDE Platform** - Complete AI-powered development environment
→ **[See README_FULL_STACK.md](README_FULL_STACK.md)** for the full AI-powered IDE with:
- 🤖 Groq AI agents (4 specialized agents, 750 tokens/sec)
- 💻 Custom Theia IDE with Figma Explorer and AI Composer
- 📱 Live preview with Expo Snack API
- 🗄️ Backend integration (MCP: Bubble, Supabase, Firebase)
- 🖥️ Tauri desktop app (3MB native wrapper)
- **[Installation Guide](INSTALLATION.md)** | **[Architecture](FULL_STACK_ARCHITECTURE.md)**

---

## Features

### Core Capabilities
- **Multiple Interfaces**: CLI tool and Figma Plugin
- **Smart Component Detection**: Automatically recognizes Button → TouchableOpacity, Images, TextInputs, ScrollViews
- **Auto Layout → Flexbox**: Perfect conversion of Figma Auto Layout to responsive React Native layouts
- **Design Tokens**: Extract colors, typography, spacing, shadows, and border radius
- **Multiple Styling Options**: StyleSheet, styled-components, or inline styles
- **Asset Management**: Automatic extraction and download of images and SVGs
- **TypeScript Support**: Full TypeScript definitions and type-safe code generation
- **Validation & Error Handling**: Built-in validation with helpful error messages
- **Style Optimization**: Automatic deduplication and optimization of styles

### Smart Component Detection
The generator intelligently detects component types based on naming patterns and properties:

- **TouchableOpacity/Pressable**: Nodes named "Button", "btn", or with interaction patterns
- **Image**: Vectors, SVGs, and nodes with image fills or names like "icon", "logo", "avatar"
- **TextInput**: Nodes named "input", "textfield", "textbox"
- **ScrollView**: Tall frames or nodes with overflow scrolling
- **FlatList**: Repeated child patterns

### Generated Code Quality
- Clean, readable code following React Native best practices
- Proper component hierarchy and nesting
- Responsive layouts using Flexbox
- Optimized styles with no duplication
- TypeScript types and interfaces
- Props and event handlers for interactive components

## Installation

### CLI Tool

```bash
npm install -g figma-to-react-native
```

### For Expo Projects

```bash
# In your Expo project
npm install figma-to-react-native --save-dev

# Or use npx (no installation needed)
npx figma-to-react-native generate <file-id>
```

See [EXPO_COMPATIBILITY.md](./EXPO_COMPATIBILITY.md) for complete Expo integration guide.

### Figma Plugin

Install from Figma Community or build locally:

```bash
npm install
npm run build:plugin
```

## Quick Start

### CLI Usage

```bash
# Set your Figma API token (get it from https://www.figma.com/developers/api#access-tokens)
export FIGMA_TOKEN="your-figma-personal-access-token"

# Generate React Native code
figma-rn generate <file-id> --output ./components

# With specific styling
figma-rn generate <file-id> --style styled-components --output ./components

# With asset extraction
figma-rn generate <file-id> --assets --output ./output

# Extract design tokens only
figma-rn tokens <file-id> --output ./tokens.ts

# Initialize configuration file
figma-rn init
```

### CLI Options

```bash
figma-rn generate <file-id> [options]

Options:
  -o, --output <path>       Output directory (default: "./output")
  -s, --style <type>        Style type: stylesheet|styled-components|inline (default: "stylesheet")
  -t, --typescript          Generate TypeScript code (default: true)
  --no-typescript           Generate JavaScript code
  -r, --responsive          Use responsive Auto Layout (default: true)
  -a, --assets              Extract and download assets
  -d, --tokens              Extract design tokens
  -n, --node-ids <ids>      Specific node IDs (comma-separated)
```

### Figma Plugin Usage

1. Open your Figma file
2. Go to Plugins → Development → "Figma to React Native"
3. Select the layers you want to convert
4. Choose your styling preference
5. Click "Generate Code"
6. Copy the generated code

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

This generator was built by analyzing 5 leading Figma-to-React Native repositories:

1. **[onome3d/Fig-Native](https://github.com/onome3d/Fig-Native)** - Component mapping approach
2. **[Curebase/figma-to-react-native](https://github.com/Curebase/figma-to-react-native)** - Auto Layout responsive styles and TypeScript
3. **[erisvaldojunior/figma-to-react-native](https://github.com/erisvaldojunior/figma-to-react-native)** - Component configuration system
4. **[kat-tax/figma-to-react-native](https://github.com/kat-tax/figma-to-react-native)** - Design tokens and theming
5. **[kazuyaseki/figma-to-react](https://github.com/kazuyaseki/figma-to-react)** - Abstract intermediate representation

### How It Works

```
Figma Design
    ↓
Figma API / Plugin API
    ↓
Validator (checks structure, dimensions, colors)
    ↓
Node Parser (converts to abstract format)
    ↓
Component Detector (identifies TouchableOpacity, Image, etc.)
    ↓
Style Optimizer (deduplicates and optimizes)
    ↓
Code Generator (StyleSheet/styled-components/inline)
    ↓
Asset Extractor (downloads images/SVGs)
    ↓
Output (Components + Styles + Assets + Design Tokens)
```

### Project Structure

```
src/
├── core/
│   ├── parser/           # Figma node parsing
│   │   ├── node-parser.ts
│   │   └── token-extractor.ts
│   ├── generator/        # Code generation
│   │   ├── stylesheet-generator.ts
│   │   ├── styled-components-generator.ts
│   │   └── inline-generator.ts
│   ├── detector/         # Smart component detection
│   │   └── component-detector.ts
│   ├── optimizer/        # Style optimization
│   │   └── style-optimizer.ts
│   ├── asset/           # Asset extraction
│   │   └── asset-extractor.ts
│   ├── validator/       # Input validation
│   │   └── node-validator.ts
│   └── converter.ts     # Main orchestrator
├── plugin/              # Figma plugin
│   ├── code.ts
│   ├── ui.html
│   └── manifest.json
├── cli/                 # CLI interface
│   └── index.ts
├── utils/               # Utilities
│   ├── figma-api.ts
│   └── color.ts
└── types/               # TypeScript definitions
    └── index.ts
```

## Examples

### Generated Button Component

```tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const PrimaryButton: React.FC = () => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={() => {}}>
      <Text style={styles.label}>Click Me</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  label: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

### Generated Design Tokens

```typescript
export const colors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  success: "#34C759",
  background: "#FFFFFF",
  text_primary: "#000000"
};

export const typography = [
  {
    name: "heading_1",
    fontFamily: "System",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40
  }
];
```

See the [examples/](./examples) directory for more generated code samples.

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

# Run linter
npm run lint

# Watch mode
npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- color.test.ts
```

## API Documentation

### FigmaConverter

```typescript
import { FigmaConverter } from 'figma-to-react-native';

const converter = new FigmaConverter(token, config);
const output = await converter.convert(fileId, nodeIds);
```

### ComponentDetector

```typescript
import { ComponentDetector } from 'figma-to-react-native';

const detector = new ComponentDetector();
const componentType = detector.getComponentType(node);
const props = detector.getRequiredProps(node, componentType);
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full API documentation.

## Roadmap

- [ ] Support for Figma variants and component props
- [ ] Figma variables integration
- [ ] Animation detection and generation
- [ ] Dark mode / theme switching
- [ ] Storybook integration
- [ ] Real-time preview
- [ ] VS Code extension
- [ ] Component library generation
- [ ] Accessibility annotations
- [ ] Localization support

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT © [Contributors](./LICENSE)

## Acknowledgments

This project combines best practices from:
- onome3d/Fig-Native
- Curebase/figma-to-react-native
- erisvaldojunior/figma-to-react-native
- kat-tax/figma-to-react-native
- kazuyaseki/figma-to-react

## Support

- [GitHub Issues](https://github.com/your-repo/figma-to-react-native/issues)
- [Documentation](https://github.com/your-repo/figma-to-react-native/wiki)
- [Figma Community](https://www.figma.com/community)

---

Made with ❤️ by the community
