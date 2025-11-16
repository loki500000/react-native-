/**
 * Figma Plugin Main Code
 * Runs in Figma's sandbox environment
 */

import { NodeParser } from '../core/parser/node-parser';
import { StyleSheetGenerator } from '../core/generator/stylesheet-generator';
import { StyledComponentsGenerator } from '../core/generator/styled-components-generator';
import { TokenExtractor } from '../core/parser/token-extractor';

// Show plugin UI
figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    await handleGenerate(msg.config);
  } else if (msg.type === 'extract-tokens') {
    await handleExtractTokens();
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

/**
 * Handle code generation
 */
async function handleGenerate(config: any) {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select at least one layer',
    });
    return;
  }

  try {
    const results: any[] = [];
    const parser = new NodeParser();

    for (const node of selection) {
      // Convert Figma node to our abstract format
      const parsedNode = parser.parse(node);

      // Generate code based on style type
      let generator;
      if (config.styleType === 'styled-components') {
        generator = new StyledComponentsGenerator();
      } else {
        generator = new StyleSheetGenerator();
      }

      const component = generator.generate(parsedNode, config.typescript);

      results.push({
        name: component.name,
        code: component.code,
      });
    }

    // Send results to UI
    figma.ui.postMessage({
      type: 'generated',
      components: results,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: `Generation failed: ${error}`,
    });
  }
}

/**
 * Handle design token extraction
 */
async function handleExtractTokens() {
  try {
    const extractor = new TokenExtractor();

    // Create a mock Figma file structure
    const figmaFile = {
      document: figma.root,
      styles: {}, // Figma plugin API doesn't expose styles directly
    };

    const tokens = extractor.extractTokens(figmaFile);
    const tokensCode = extractor.generateTokensFile(tokens, 'ts');

    figma.ui.postMessage({
      type: 'tokens-extracted',
      code: tokensCode,
      tokens,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: `Token extraction failed: ${error}`,
    });
  }
}

// Initial load - check selection
figma.on('selectionchange', () => {
  const count = figma.currentPage.selection.length;
  figma.ui.postMessage({
    type: 'selection-changed',
    count,
  });
});

// Send initial selection count
figma.ui.postMessage({
  type: 'selection-changed',
  count: figma.currentPage.selection.length,
});
