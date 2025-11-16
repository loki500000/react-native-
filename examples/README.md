# Examples

This directory contains example outputs from the Figma to React Native code generator.

## Files

### Button.example.tsx
A simple button component generated with StyleSheet styling. Shows:
- Basic View and Text components
- StyleSheet.create() usage
- Flexbox layout from Figma Auto Layout
- Color and typography conversion

### Card.styled.example.tsx
A card component generated with styled-components. Demonstrates:
- styled-components/native usage
- CSS-in-JS syntax
- Nested component structure
- Gap property for spacing

### designTokens.example.ts
Extracted design tokens from a Figma file. Includes:
- Color palette
- Typography scale
- Spacing system
- Border radius values
- Shadow styles

## Usage

These examples show what the generated code looks like. To generate your own components:

### Using CLI:
```bash
figma-rn generate <file-id> --output ./components
```

### Using Plugin:
1. Open Figma
2. Run "Figma to React Native" plugin
3. Select layers
4. Click "Generate Code"
5. Copy the output

## Customization

Modify the generation behavior using `figma-rn.config.json`:

```json
{
  "styleType": "stylesheet",
  "typescript": true,
  "responsive": true,
  "designTokens": true
}
```
