#!/usr/bin/env node

/**
 * CLI for Figma to React Native converter
 */

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { FigmaConverter } from '../core/converter';
import { GeneratorConfig } from '../types';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('figma-rn')
  .description('Convert Figma designs to React Native code')
  .version('1.0.0');

// Generate command
program
  .command('generate <file-id>')
  .description('Generate React Native code from a Figma file')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('-s, --style <type>', 'Style type (stylesheet|styled-components|inline)', 'stylesheet')
  .option('-t, --typescript', 'Generate TypeScript code', true)
  .option('--no-typescript', 'Generate JavaScript code')
  .option('-r, --responsive', 'Use responsive Auto Layout', true)
  .option('--no-responsive', 'Disable responsive layouts')
  .option('-a, --assets', 'Extract and download assets', false)
  .option('-d, --tokens', 'Extract design tokens', false)
  .option('-n, --node-ids <ids>', 'Specific node IDs to generate (comma-separated)')
  .action(async (fileId: string, options: any) => {
    const spinner = ora('Initializing...').start();

    try {
      // Check for Figma token
      const token = process.env.FIGMA_TOKEN;
      if (!token) {
        spinner.fail(chalk.red('Error: FIGMA_TOKEN environment variable not set'));
        console.log(chalk.yellow('\nSet your Figma token:'));
        console.log(chalk.cyan('  export FIGMA_TOKEN="your-figma-personal-access-token"'));
        console.log(chalk.yellow('\nGet your token from: https://www.figma.com/developers/api#access-tokens'));
        process.exit(1);
      }

      // Create output directory
      const outputPath = path.resolve(options.output);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // Build config
      const config: GeneratorConfig = {
        styleType: options.style,
        typescript: options.typescript,
        componentPrefix: '',
        extractAssets: options.assets,
        responsive: options.responsive,
        designTokens: options.tokens,
        outputPath,
      };

      spinner.text = 'Fetching Figma file...';

      // Create converter
      const converter = new FigmaConverter(token, config);

      // Parse node IDs if provided
      const nodeIds = options.nodeIds ? options.nodeIds.split(',') : undefined;

      spinner.text = 'Parsing design...';

      // Generate code
      const result = await converter.convert(fileId, nodeIds);

      spinner.text = 'Writing files...';

      // Write components
      for (const component of result.components) {
        const ext = config.typescript ? 'tsx' : 'jsx';
        const filePath = path.join(outputPath, `${component.name}.${ext}`);
        fs.writeFileSync(filePath, component.code);
      }

      // Write design tokens if requested
      if (config.designTokens && result.designTokens) {
        const tokensPath = path.join(outputPath, 'designTokens.ts');
        const { TokenExtractor } = await import('../core/parser/token-extractor');
        const extractor = new TokenExtractor();
        const tokensCode = extractor.generateTokensFile(result.designTokens);
        fs.writeFileSync(tokensPath, tokensCode);
      }

      // Write index file
      if (result.index) {
        const indexPath = path.join(outputPath, `index.${config.typescript ? 'ts' : 'js'}`);
        fs.writeFileSync(indexPath, result.index);
      }

      spinner.succeed(chalk.green(`Generated ${result.components.length} component(s)`));

      console.log(chalk.cyan('\nOutput directory:'), outputPath);
      console.log(chalk.cyan('Components:'));
      result.components.forEach(c => {
        console.log(chalk.gray(`  - ${c.name}`));
      });

      if (result.designTokens) {
        console.log(chalk.cyan('\n✓ Design tokens extracted'));
      }

      if (result.assets.length > 0) {
        console.log(chalk.cyan(`\n✓ ${result.assets.length} asset(s) exported`));
      }

    } catch (error: any) {
      spinner.fail(chalk.red('Generation failed'));
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

// Tokens command
program
  .command('tokens <file-id>')
  .description('Extract design tokens from a Figma file')
  .option('-o, --output <path>', 'Output file path', './designTokens.ts')
  .option('-f, --format <type>', 'Output format (ts|json)', 'ts')
  .action(async (fileId: string, options: any) => {
    const spinner = ora('Extracting design tokens...').start();

    try {
      const token = process.env.FIGMA_TOKEN;
      if (!token) {
        spinner.fail(chalk.red('Error: FIGMA_TOKEN not set'));
        process.exit(1);
      }

      const { FigmaAPI } = await import('../utils/figma-api');
      const { TokenExtractor } = await import('../core/parser/token-extractor');

      spinner.text = 'Fetching Figma file...';

      const api = new FigmaAPI(token);
      const figmaFile = await api.getFile(fileId);

      spinner.text = 'Extracting tokens...';

      const extractor = new TokenExtractor();
      const tokens = extractor.extractTokens(figmaFile);
      const code = extractor.generateTokensFile(tokens, options.format as 'ts' | 'json');

      spinner.text = 'Writing file...';

      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, code);

      spinner.succeed(chalk.green('Design tokens extracted'));

      console.log(chalk.cyan('\nOutput file:'), outputPath);
      console.log(chalk.cyan('\nTokens:'));
      console.log(chalk.gray(`  - ${Object.keys(tokens.colors).length} colors`));
      console.log(chalk.gray(`  - ${tokens.typography.length} typography styles`));
      console.log(chalk.gray(`  - ${Object.keys(tokens.spacing).length} spacing values`));
      console.log(chalk.gray(`  - ${tokens.shadows.length} shadow styles`));

    } catch (error: any) {
      spinner.fail(chalk.red('Extraction failed'));
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

// Config init command
program
  .command('init')
  .description('Create a configuration file')
  .action(() => {
    const configPath = path.resolve('figma-rn.config.json');

    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('Configuration file already exists'));
      return;
    }

    const defaultConfig = {
      styleType: 'stylesheet',
      typescript: true,
      componentPrefix: '',
      extractAssets: true,
      responsive: true,
      designTokens: true,
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

    console.log(chalk.green('✓ Created figma-rn.config.json'));
    console.log(chalk.cyan('\nEdit this file to customize generation settings'));
  });

program.parse();
