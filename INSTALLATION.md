# Figma Studio AI - Installation & Setup Guide

Complete guide to install and run the full-stack AI-powered IDE.

## 📋 Prerequisites

### Required:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Yarn** package manager (`npm install -g yarn`)
- **Git** ([Download](https://git-scm.com/))

### For Desktop App:
- **Rust** ([Install](https://www.rust-lang.org/tools/install))
- **Tauri CLI** (`cargo install tauri-cli`)

### API Keys Needed:
1. **Figma Personal Access Token** ([Get it here](https://www.figma.com/developers/api#access-tokens))
2. **Groq API Key** ([Get it here](https://console.groq.com/keys))
3. **Backend API Keys** (Optional):
   - Bubble.io API Token
   - Supabase URL + Keys
   - Firebase credentials

---

## 🚀 Quick Start (Development Mode)

### Step 1: Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd figma-studio-ai

# Install dependencies (uses Lerna + Yarn workspaces)
yarn install

# Build all packages
yarn build
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env
```

Add your keys:
```bash
# Figma
FIGMA_TOKEN=figd_xxxxxxxxxxxxx

# Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Optional: Backend integrations
BUBBLE_APP_NAME=your-app
BUBBLE_API_TOKEN=xxxxx

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

FIREBASE_PROJECT_ID=your-project
FIREBASE_API_KEY=xxxxx
```

### Step 3: Start Services

Open **3 terminals**:

**Terminal 1: Preview Server**
```bash
cd preview-server
yarn dev

# Running on http://localhost:3002
```

**Terminal 2: IDE (Theia)**
```bash
cd ide-app
yarn start

# IDE running on http://localhost:3000
```

**Terminal 3: Desktop App (Tauri)**
```bash
cd desktop-app
yarn tauri dev

# Desktop app will launch
```

---

## 🏗️ Full Installation Steps

### 1. Install System Dependencies

#### macOS:
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node yarn rust

# Install Tauri CLI
cargo install tauri-cli
```

#### Linux (Ubuntu/Debian):
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
npm install -g yarn

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install build dependencies for Tauri
sudo apt-get install -y libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Windows:
```bash
# Install Node.js from https://nodejs.org/
# Install Rust from https://www.rust-lang.org/tools/install

# Install Yarn
npm install -g yarn

# Install Visual Studio C++ Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
```

### 2. Build Project

```bash
# Clone repository
git clone <repo-url>
cd figma-studio-ai

# Install all dependencies
yarn install

# Build all packages
yarn build
```

This builds:
- ✅ Core code generator (`src/`)
- ✅ AI engine (`ai-engine/`)
- ✅ MCP servers (`mcp-servers/`)
- ✅ Preview server (`preview-server/`)
- ✅ IDE app (`ide-app/`)
- ✅ Desktop app (`desktop-app/`)

### 3. Configure API Keys

Create `.env` file in root:

```bash
# Figma API
FIGMA_TOKEN=your-figma-token

# Groq AI
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.1-70b-versatile

# Preview Server
PREVIEW_SERVER_PORT=3002

# IDE Server
IDE_SERVER_PORT=3000

# MCP Servers (Optional)
BUBBLE_APP_NAME=your-app
BUBBLE_API_TOKEN=your-token
BUBBLE_VERSION=live

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

FIREBASE_PROJECT_ID=your-project
FIREBASE_API_KEY=your-api-key
```

### 4. Start in Development Mode

**Option A: Start All Services (Recommended)**
```bash
# In root directory
yarn dev

# This starts:
# - Preview server (port 3002)
# - IDE server (port 3000)
# - Desktop app
```

**Option B: Start Individually**
```bash
# Terminal 1: Preview Server
cd preview-server && yarn dev

# Terminal 2: IDE
cd ide-app && yarn start

# Terminal 3: Desktop App
cd desktop-app && yarn tauri dev
```

---

## 🖥️ Production Build

### Build Desktop App

```bash
cd desktop-app

# macOS
yarn tauri build

# Linux
yarn tauri build

# Windows
yarn tauri build

# Output:
# macOS: desktop-app/src-tauri/target/release/bundle/macos/
# Linux: desktop-app/src-tauri/target/release/bundle/appimage/
# Windows: desktop-app/src-tauri/target/release/bundle/msi/
```

### Build Standalone Packages

```bash
# Build CLI tool only
cd src
yarn build

# Create npm package
npm pack

# Install globally
npm install -g figma-to-react-native-1.0.0.tgz
```

---

## 🎯 First Run Guide

### 1. Launch Desktop App

After building, launch the desktop app:

- **macOS**: Open `Figma Studio AI.app`
- **Windows**: Run `Figma Studio AI.exe`
- **Linux**: Run `figma-studio-ai.AppImage`

### 2. Configure Settings

On first launch, you'll see settings:

```
Settings → API Keys
├─ Figma Token: [Enter your token]
├─ Groq API Key: [Enter your key]
└─ Backend Connections
   ├─ Bubble.io: [Optional]
   ├─ Supabase: [Optional]
   └─ Firebase: [Optional]
```

### 3. Import Figma Design

```
File → Import from Figma
├─ Paste Figma file URL
├─ Select pages to import
└─ Click "Import"

AI will analyze your design...
```

### 4. Generate Code

```
AI will suggest:
"I found 12 screens and 45 components.
 What would you like to build first?"

You: "Build the home screen"

AI generates code in 30 seconds...
```

### 5. Preview

```
Preview panel shows:
├─ iOS simulator
├─ Android emulator
├─ Web preview
└─ QR code (scan to test on phone)
```

### 6. Chat with AI

```
You: "Add dark mode"
AI: Generates theme system...

You: "Connect to my Bubble users table"
AI: Generates API integration...

You: "Make button animated"
AI: Adds animations...
```

---

## 🔧 Troubleshooting

### Issue: Tauri build fails

```bash
# macOS: Install Xcode Command Line Tools
xcode-select --install

# Linux: Install missing dependencies
sudo apt-get install -y libwebkit2gtk-4.0-dev

# Windows: Install Visual Studio C++ Build Tools
```

### Issue: IDE won't start

```bash
# Clear cache and rebuild
rm -rf ide-app/node_modules
cd ide-app && yarn install && yarn build
```

### Issue: Preview server connection error

```bash
# Check if port 3002 is available
lsof -i :3002

# Kill process if needed
kill -9 <PID>

# Restart preview server
cd preview-server && yarn dev
```

### Issue: Groq API errors

```bash
# Verify API key is valid
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"

# Check .env file has correct key
cat .env | grep GROQ_API_KEY
```

---

## 📚 Next Steps

Once installed:

1. **Read User Guide**: `docs/USER_GUIDE.md`
2. **Try Examples**: `examples/`
3. **Join Community**: [Discord/GitHub Discussions]
4. **Report Issues**: [GitHub Issues]

---

## 🆘 Getting Help

- **Documentation**: `docs/`
- **GitHub Issues**: Report bugs
- **Discord**: Community support
- **Email**: support@figmastudio.ai

---

## 🎓 Video Tutorials

Coming soon:
- Installation walkthrough
- First project tutorial
- AI features deep dive
- MCP integration guide

---

**Installed successfully?** 🎉

Run: `yarn dev` and start building!
