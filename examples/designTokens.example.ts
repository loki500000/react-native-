/**
 * Example: Design Tokens extracted from Figma
 * This shows how design tokens are extracted and structured
 */

export const colors = {
  "primary": "#007AFF",
  "secondary": "#5856D6",
  "success": "#34C759",
  "warning": "#FF9500",
  "error": "#FF3B30",
  "background": "#FFFFFF",
  "surface": "#F2F2F7",
  "text_primary": "#000000",
  "text_secondary": "#666666",
  "border": "#E5E5EA"
};

export const typography = [
  {
    "name": "heading_1",
    "fontFamily": "System",
    "fontSize": 32,
    "fontWeight": "700",
    "lineHeight": 40,
    "letterSpacing": 0
  },
  {
    "name": "heading_2",
    "fontFamily": "System",
    "fontSize": 24,
    "fontWeight": "600",
    "lineHeight": 32,
    "letterSpacing": 0
  },
  {
    "name": "body",
    "fontFamily": "System",
    "fontSize": 16,
    "fontWeight": "400",
    "lineHeight": 24,
    "letterSpacing": 0
  },
  {
    "name": "caption",
    "fontFamily": "System",
    "fontSize": 12,
    "fontWeight": "400",
    "lineHeight": 16,
    "letterSpacing": 0
  }
];

export const spacing = {
  "spacing_4": 4,
  "spacing_8": 8,
  "spacing_12": 12,
  "spacing_16": 16,
  "spacing_24": 24,
  "spacing_32": 32
};

export const borderRadius = {
  "radius_4": 4,
  "radius_8": 8,
  "radius_12": 12,
  "radius_16": 16
};

export const shadows = [
  {
    "name": "card_shadow",
    "shadowColor": "#000000",
    "shadowOffset": {
      "width": 0,
      "height": 2
    },
    "shadowOpacity": 0.1,
    "shadowRadius": 8,
    "elevation": 3
  }
];

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default designTokens;
