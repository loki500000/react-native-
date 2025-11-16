# Full-Stack Architecture: Figma Studio AI

## Overview
Complete AI-powered IDE for building full-stack React Native apps with Figma designs and no-code backends.

## Tech Stack

### Frontend IDE
```typescript
{
  "base": "Theia IDE Framework",
  "desktop": "Tauri (3MB bundle)",
  "editor": "Monaco Editor",
  "preview": "Expo Snack API"
}
```

### AI Layer
```typescript
{
  "llm": "Groq API (Llama 3.1 70B)",
  "models": ["llama-3.1-70b-versatile", "llama-3.1-8b-instant"],
  "context": "Tree-sitter + Vector embeddings",
  "agents": {
    "designer": "Figma → React Native",
    "developer": "Feature implementation",
    "backend": "API integration & MCP",
    "database": "Schema management",
    "reviewer": "Code quality",
    "tester": "Test generation"
  }
}
```

### MCP Integration (NEW!)
```typescript
{
  "protocol": "Model Context Protocol",
  "servers": {
    // Database MCP Servers
    "supabase-mcp": {
      "capabilities": ["schema", "auth", "storage", "realtime"],
      "autoGenerate": ["TypeScript types", "React hooks", "API functions"]
    },
    "firebase-mcp": {
      "capabilities": ["firestore", "auth", "storage", "functions"],
      "autoGenerate": ["Collection hooks", "Auth flows", "Security rules"]
    },
    "postgresql-mcp": {
      "capabilities": ["schema", "queries", "migrations"],
      "autoGenerate": ["Prisma models", "SQL queries", "TypeORM entities"]
    },

    // No-Code Platform MCP Servers
    "bubble-mcp": {
      "capabilities": ["data-types", "workflows", "api", "auth"],
      "autoGenerate": ["API client", "TypeScript types", "React hooks"]
    },
    "airtable-mcp": {
      "capabilities": ["bases", "tables", "views", "automations"],
      "autoGenerate": ["Types", "CRUD hooks", "Sync functions"]
    },
    "retool-mcp": {
      "capabilities": ["queries", "resources"],
      "autoGenerate": ["API adapters", "Query hooks"]
    },

    // API MCP Servers
    "openapi-mcp": {
      "capabilities": ["schema-import", "endpoint-generation"],
      "autoGenerate": ["Full API client", "Types", "Hooks"]
    },
    "graphql-mcp": {
      "capabilities": ["schema-introspection", "codegen"],
      "autoGenerate": ["Queries", "Mutations", "Fragments", "Types"]
    }
  }
}
```

## User Flows

### Flow 1: Full-Stack App from Scratch

```typescript
// User opens Figma Studio AI

Step 1: Design Import
User: Pastes Figma file URL
AI: "I see a login screen, home feed, and profile. What backend?"
User: "Use Bubble.io"

Step 2: Backend Connection
AI: Connects to Bubble via MCP
AI: "Found User and Post data types in Bubble. Should I use these?"
User: "Yes"

Step 3: Code Generation
AI generates:
├── screens/
│   ├── LoginScreen.tsx          # From Figma
│   ├── HomeFeedScreen.tsx       # From Figma
│   └── ProfileScreen.tsx        # From Figma
├── api/
│   ├── bubble.ts                # Auto-generated Bubble client
│   ├── auth.ts                  # Bubble auth integration
│   └── posts.ts                 # Post CRUD operations
├── hooks/
│   ├── useBubbleAuth.ts         # Auth hook
│   ├── usePosts.ts              # Posts hook
│   └── useCurrentUser.ts        # User hook
├── types/
│   ├── User.ts                  # From Bubble schema
│   └── Post.ts                  # From Bubble schema
└── navigation/
    └── AppNavigator.tsx         # Auto-generated

Step 4: Live Preview
User: Sees working app in Expo preview
User: Scans QR code, tests on phone
User: "Add ability to like posts"

Step 5: AI Updates
AI:
- Adds "likes" array to Post type in Bubble
- Generates likePost() API function
- Adds heart button to feed UI (from Figma icon)
- Updates preview in real-time

Result: Full-stack app in 5 minutes!
```

### Flow 2: Chat-Driven Backend Integration

```bash
User: "Connect to my Supabase project"

AI: "Please provide your Supabase URL and anon key"

User: [Provides credentials]

AI via MCP:
✅ Connected to Supabase
✅ Found tables: users, posts, comments, likes
✅ Detected Row Level Security policies
✅ Found Storage bucket: avatars

AI: "I see you have authentication set up.
     Should I generate login/signup screens?"

User: "Yes, with Google sign-in"

AI generates:
├── auth/
│   ├── LoginScreen.tsx          # Figma design
│   ├── SignupScreen.tsx         # Figma design
│   └── GoogleSignIn.tsx         # Google OAuth
├── api/
│   ├── supabase.ts              # Supabase client
│   └── auth.ts                  # Auth functions
├── hooks/
│   ├── useAuth.ts               # Auth state
│   └── useUser.ts               # Current user
└── types/
    └── database.types.ts        # Generated from Supabase

User: "Now add a feed showing all posts"

AI:
- Finds posts table via MCP
- Generates FeedScreen.tsx from Figma
- Creates usePosts() hook with realtime subscription
- Adds infinite scroll
- Shows in preview

User: "Let users upload profile pictures"

AI:
- Generates image picker UI
- Creates upload function to Supabase Storage
- Adds image optimization
- Updates user profile
- Shows in preview
```

### Flow 3: API Import and Integration

```typescript
User: "Import API from https://api.example.com/swagger.json"

AI via OpenAPI MCP:
✅ Imported 23 endpoints
✅ Generated TypeScript types for all models
✅ Created React hooks for each endpoint
✅ Added error handling
✅ Added authentication headers

Generated:
├── api/
│   ├── generated/
│   │   ├── client.ts            # Axios/Fetch client
│   │   ├── endpoints.ts         # All endpoints
│   │   └── types.ts             # Response types
│   └── hooks/
│       ├── useGetUsers.ts
│       ├── useCreatePost.ts
│       └── useUpdateProfile.ts

User: "Show user list using the getUsers endpoint"

AI:
- Finds UserList design in Figma
- Generates UserListScreen.tsx
- Integrates useGetUsers hook
- Adds loading/error states
- Shows in preview

All type-safe, all auto-completed!
```

## MCP Server Architecture

```typescript
// MCP Server Interface
interface MCPServer {
  name: string;
  capabilities: string[];

  // Schema introspection
  getSchema(): Promise<Schema>;

  // Data operations
  query(query: string): Promise<any>;
  mutate(mutation: Mutation): Promise<any>;

  // Code generation
  generateTypes(): Promise<string>;
  generateHooks(): Promise<string>;
  generateAPI(): Promise<string>;
}

// Example: Bubble MCP Server
class BubbleMCPServer implements MCPServer {
  async getSchema() {
    const dataTypes = await bubbleAPI.getDataTypes();
    return {
      tables: dataTypes.map(type => ({
        name: type.name,
        fields: type.fields,
        relations: type.relations
      }))
    };
  }

  async generateTypes() {
    const schema = await this.getSchema();
    return `
      export interface User {
        _id: string;
        email: string;
        name: string;
        created_date: Date;
      }

      export interface Post {
        _id: string;
        user_id: string;
        title: string;
        content: string;
        created_date: Date;
      }
    `;
  }

  async generateHooks() {
    return `
      export function useBubbleUsers() {
        const [users, setUsers] = useState<User[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
          fetchBubbleData('User')
            .then(setUsers)
            .finally(() => setLoading(false));
        }, []);

        return { users, loading };
      }
    `;
  }
}
```

## Settings Panel

```typescript
interface Settings {
  // AI Configuration
  ai: {
    provider: "groq" | "openai" | "anthropic";
    model: string;
    apiKey: string;
    temperature: number;
  };

  // MCP Servers
  mcp: {
    servers: {
      [serverName: string]: {
        enabled: boolean;
        config: {
          url?: string;
          apiKey?: string;
          projectId?: string;
          // Server-specific config
        };
      };
    };
  };

  // Figma
  figma: {
    token: string;
    defaultFileId?: string;
  };

  // Preview
  preview: {
    device: "ios" | "android" | "web";
    hotReload: boolean;
  };
}

// Example MCP Settings UI:
{
  "Supabase": {
    enabled: true,
    url: "https://xxx.supabase.co",
    anonKey: "eyJ...",
    serviceKey: "eyJ..." // optional for admin
  },

  "Bubble.io": {
    enabled: true,
    appName: "my-app",
    apiToken: "xxx",
    version: "live"
  },

  "Firebase": {
    enabled: false, // can enable multiple!
    projectId: "my-project",
    apiKey: "xxx"
  }
}
```

## AI Agent System with MCP

```typescript
const agents = {
  // Frontend Agent
  designer: {
    role: "Convert Figma to React Native",
    context: ["Figma designs", "Design tokens"],
    output: "UI components"
  },

  // Backend Agent (NEW!)
  backend: {
    role: "Database and API integration",
    context: [
      "MCP server schemas",
      "Database tables",
      "API endpoints",
      "Authentication flows"
    ],
    output: "API clients, hooks, types",

    skills: [
      "Read database schema via MCP",
      "Generate TypeScript types from schema",
      "Create CRUD hooks",
      "Handle authentication",
      "Manage state synchronization",
      "Error handling",
      "Optimistic updates"
    ]
  },

  // Full-Stack Orchestrator
  orchestrator: {
    role: "Coordinate frontend + backend",
    workflow: async (userPrompt) => {
      // 1. Understand what user wants
      const intent = await analyzeIntent(userPrompt);

      // 2. Check if backend needed
      if (intent.needsBackend) {
        // Ask backend agent about available data
        const schema = await agents.backend.getSchema();

        // Ask designer agent to create UI
        const ui = await agents.designer.generateFromFigma(intent.screen);

        // Connect them
        const integration = await connectUItoBackend(ui, schema);

        return integration;
      }
    }
  }
};
```

## Example: Complete Feature Generation

```typescript
User: "Add a social feed where users can post photos and like posts"

AI Orchestrator thinks:
1. ✅ Need backend: Yes (posts, likes, users)
2. ✅ Check MCP for existing schema
3. ✅ Check Figma for feed design

AI Backend Agent:
- Connects to Bubble via MCP
- Finds: User table exists ✓
- Missing: Post table, Like table
- Suggests creating them in Bubble

AI: "I need to create Post and Like tables in Bubble. Approve?"
User: "Yes"

AI Backend Agent:
- Creates Post table in Bubble (title, image_url, user, created_date)
- Creates Like table in Bubble (user, post, created_date)
- Generates TypeScript types
- Generates API functions
- Generates React hooks

AI Designer Agent:
- Finds "Feed" screen in Figma
- Finds "Post Card" component in Figma
- Generates FeedScreen.tsx
- Generates PostCard.tsx component

AI Integration:
- Connects FeedScreen to usePosts() hook
- Adds infinite scroll
- Adds pull-to-refresh
- Adds like button with animation
- Handles image upload
- Adds loading states

Result in preview:
- Working social feed
- Can create posts with photos
- Can like posts
- Real-time updates
- All type-safe
- All working on real backend

Time: 3 minutes
Manual coding time: 4+ hours
```

## File Structure

```
figma-studio-ai/
├── desktop-app/              # Tauri wrapper
├── theia-ide/               # IDE core
│   └── extensions/
│       ├── figma-explorer/
│       ├── ai-composer/
│       ├── mcp-manager/     # NEW! MCP integration
│       ├── backend-panel/   # NEW! Backend visualization
│       └── live-preview/
│
├── ai-engine/
│   ├── agents/
│   │   ├── designer.ts
│   │   ├── developer.ts
│   │   ├── backend.ts       # NEW! Backend agent
│   │   └── orchestrator.ts
│   └── mcp/                 # NEW! MCP servers
│       ├── bubble-mcp/
│       ├── supabase-mcp/
│       ├── firebase-mcp/
│       ├── airtable-mcp/
│       └── openapi-mcp/
│
├── code-generators/
│   ├── figma-to-rn/        # Existing
│   └── mcp-to-code/        # NEW! MCP code gen
│       ├── type-generator.ts
│       ├── hook-generator.ts
│       └── api-generator.ts
│
└── preview-server/
    └── expo-snack-api.ts
```

## Benefits

### For Developers:
✅ Full-stack development in one tool
✅ No manual API integration
✅ Type-safe throughout
✅ No backend code needed (use Bubble/Supabase)
✅ Instant previews

### For No-Code Users:
✅ Build mobile apps from Bubble/Airtable
✅ No React Native knowledge needed
✅ AI writes all the code
✅ Professional mobile app output

### For Teams:
✅ Designer works in Figma
✅ Backend team works in Bubble/Supabase
✅ Frontend auto-generated
✅ Everything stays in sync

## Next Steps

1. ✅ Build Theia IDE base
2. ✅ Integrate Figma parser
3. ✅ Add Groq AI
4. ✅ Build MCP servers for Bubble, Supabase, Firebase
5. ✅ Create backend agent
6. ✅ Add live preview
7. ✅ Ship MVP!

This will be revolutionary! 🚀
