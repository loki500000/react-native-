# Contributing to Figma to React Native

Thank you for your interest in contributing! This project was built by analyzing and learning from 5 excellent existing repositories:

1. **onome3d/Fig-Native** - Component mapping approach
2. **Curebase/figma-to-react-native** - Auto Layout and styled-components
3. **erisvaldojunior/figma-to-react-native** - Component configuration system
4. **kat-tax/figma-to-react-native** - Design tokens and theming
5. **kazuyaseki/figma-to-react** - Abstract intermediate representation

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/figma-to-react-native.git
cd figma-to-react-native
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Figma API token:
```bash
cp .env.example .env
# Edit .env and add your FIGMA_TOKEN
```

4. Build the project:
```bash
npm run build
```

## Project Structure

```
src/
├── core/               # Core conversion logic
│   ├── parser/        # Figma node parsers
│   ├── generator/     # Code generators
│   └── converter.ts   # Main orchestrator
├── plugin/            # Figma plugin
├── cli/               # CLI interface
├── utils/             # Utilities
└── types/             # TypeScript definitions
```

## Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test:
```bash
npm test
npm run lint
```

3. Build to ensure no errors:
```bash
npm run build
```

4. Commit your changes:
```bash
git commit -m "Description of changes"
```

5. Push and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write clear, descriptive commit messages
- Add tests for new features

## Testing

Run tests with:
```bash
npm test
```

## Areas for Contribution

- **Asset Export**: Implement downloading images and SVGs from Figma
- **Additional Generators**: Add support for other styling libraries (Tailwind, etc.)
- **Component Recognition**: Improve smart component detection
- **Design Tokens**: Enhance token extraction and organization
- **Tests**: Increase test coverage
- **Documentation**: Improve docs and add more examples

## Questions?

Open an issue for any questions or suggestions!
