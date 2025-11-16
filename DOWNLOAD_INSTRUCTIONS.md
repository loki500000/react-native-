# How to Download and Work Locally

This repository is now ready to be cloned and worked on locally in VS Code or any other editor.

## Prerequisites

- **Node.js** 16.x or higher
- **npm** or **yarn**
- **Git**
- **VS Code** (recommended) or any code editor

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url> figma-to-react-native

# Navigate to the project
cd figma-to-react-native

# Switch to the development branch
git checkout claude/figma-react-native-generator-014uSCQ9aRuhWDk4jByoHbum
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all dependencies including:
- TypeScript
- Webpack
- Jest (testing)
- ESLint & Prettier (code quality)
- Figma plugin typings
- CLI dependencies (commander, chalk, ora)

## Step 3: Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Figma API token
# Get your token from: https://www.figma.com/developers/api#access-tokens
nano .env  # or use any editor
```

## Step 4: Open in VS Code

```bash
code .
```

### Recommended VS Code Extensions

Install these extensions for the best development experience:

1. **ESLint** - Microsoft
2. **Prettier - Code formatter** - Prettier
3. **TypeScript and JavaScript Language Features** (built-in)
4. **Jest** - Orta
5. **GitLens** - GitKraken

## Step 5: Build the Project

```bash
# Build everything
npm run build

# Or build specific parts
npm run build:cli      # Build CLI only
npm run build:plugin   # Build Figma plugin only
```

## Step 6: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Step 7: Development Workflow

### For CLI Development

```bash
# Watch mode for CLI
npm run dev

# Test the CLI locally
node dist/cli/index.js generate <file-id> --output ./test-output
```

### For Plugin Development

```bash
# Build plugin
npm run build:plugin

# The plugin files will be in dist/plugin/
# Load in Figma: Plugins → Development → Import plugin from manifest
# Select: dist/plugin/manifest.json
```

### Running Linter

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint -- --fix
```

### Format Code

```bash
npm run format
```

## Project Structure in VS Code

```
figma-to-react-native/
├── .github/              # GitHub Actions workflows
├── .vscode/              # VS Code settings (you can add)
├── dist/                 # Build output (gitignored)
├── examples/             # Example generated code
├── node_modules/         # Dependencies (gitignored)
├── src/                  # Source code
│   ├── cli/             # CLI implementation
│   ├── core/            # Core logic
│   │   ├── asset/       # Asset extraction
│   │   ├── detector/    # Component detection
│   │   ├── generator/   # Code generators
│   │   ├── optimizer/   # Style optimization
│   │   ├── parser/      # Figma parsing
│   │   └── validator/   # Validation
│   ├── plugin/          # Figma plugin
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities
├── .env                 # Your environment variables
├── .gitignore
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript config
├── webpack.config.js    # Webpack for CLI
├── webpack.plugin.js    # Webpack for plugin
├── jest.config.js       # Jest test config
└── README.md            # Main documentation
```

## Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in src/

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Build to verify**:
   ```bash
   npm run build
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

6. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Common Development Tasks

### Adding a New Generator

1. Create file in `src/core/generator/`
2. Implement the generator interface
3. Add to `src/core/converter.ts` switch statement
4. Export from `src/index.ts`
5. Add tests in `__tests__/`

### Adding a New Feature

1. Plan the feature in code
2. Update TypeScript types if needed (`src/types/`)
3. Implement the feature
4. Add tests
5. Update documentation
6. Run all tests and build

### Debugging

- Use VS Code debugger with breakpoints
- Check `dist/` for build output
- Use `console.log` (removed by linter, so use `// eslint-disable-next-line` if needed)
- Run specific tests: `npm test -- filename.test.ts`

## Troubleshooting

### Build Errors

```bash
# Clean build
rm -rf dist/
npm run build
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check TypeScript compilation
npx tsc --noEmit
```

## VS Code Settings (Optional)

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

## Next Steps

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Check [FEATURE_ANALYSIS.md](./FEATURE_ANALYSIS.md) for feature roadmap
- See [README.md](./README.md) for usage documentation
- Review examples in `examples/` directory

## Getting Help

- Check the documentation in the repository
- Look at test files for usage examples
- Open an issue on GitHub
- Review the 5 reference repositories mentioned in README

Happy coding! 🚀
