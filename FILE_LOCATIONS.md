# File Location Guide

## Documentation

| File               | Purpose                        |
| ------------------ | ------------------------------ |
| GETTING_STARTED.md | Quick launch in 15 minutes     |
| README.md          | Complete project guide         |
| ARCHITECTURE.md    | System design & decisions      |
| DATABASE_SCHEMA.md | Data model reference           |
| API_DESIGN.md      | API endpoint documentation     |
| PROJECT_SUMMARY.md | Tech stack & features overview |

## Backend Files

Location: `backend/src/`

### Core Application

```
app.ts                    # Express setup
server.ts                 # Server startup and graceful shutdown
```

### Routes (API Endpoints)

```
routes/
├── auth.ts               # Authentication endpoints
├── news.ts               # News API endpoints
├── summary.ts            # Summary generation endpoints
└── articles.ts           # User bookmarks endpoints
```

### Controllers (Request Handlers)

```
controllers/
├── authController.ts     # auth route logic
├── newsController.ts     # news route logic
├── summaryController.ts  # summary route logic
└── articleController.ts  # articles route logic
```

### Services (Business Logic)

```
services/
├── authService.ts        # User registration, login, JWT
├── newsService.ts        # NewsAPI integration, caching
├── summaryService.ts     # Gemini API calls, caching
└── articleService.ts     # User bookmarks management
```

### Middleware

```
middleware/
├── authMiddleware.ts     # JWT verification
└── errorHandler.ts       # Global error handling
```

### Database

```
prisma/
├── schema.prisma         # Database schema definition
└── migrations/           # Schema version history
```

### Configuration

```
.env                      # Environment variables
package.json              # Dependencies
tsconfig.json             # TypeScript configuration
```

## Frontend Files (React + TypeScript + Tailwind CSS)

Location: `frontend/src/`

### Entry Points

```
main.tsx                  # React entry point
App.tsx                   # Main router with all routes
index.css                 # Tailwind directives + custom components
```

### Pages (TypeScript .tsx)

```
pages/
├── HomePage.tsx          # News feed, search, filtering
├── LoginPage.tsx         # User login form
├── SignupPage.tsx        # User registration form
├── MyLibraryPage.tsx     # User bookmarks library
└── ProfilePage.tsx       # User profile and settings
```

### Components (TypeScript .tsx)

```
components/
├── NewsCard.tsx          # Article card display
├── SearchBar.tsx         # Search input
├── CategoryFilter.tsx    # Category buttons
└── SummaryLoader.tsx     # Loading animation
```

### Services (TypeScript .ts API Clients)

```
services/
├── apiClient.ts          # Axios instance, interceptors
├── authAPI.ts            # Auth endpoint client
├── newsAPI.ts            # News endpoint client
├── summaryAPI.ts         # Summary endpoint client
└── articleAPI.ts         # Articles endpoint client
```

### State Management

```
store/
└── AuthContext.tsx       # Global authentication state
```

### Configuration

```
tailwind.config.js        # Rose color theme, Tailwind config
tsconfig.json             # TypeScript project settings
.env.local                # Environment variables
package.json              # Dependencies
```

## Design System

### Tailwind CSS Configuration

```
tailwind.config.js        # Rose theme colors
postcss.config.js         # @tailwindcss/postcss plugin
```

### Rose Theme Colors

- Primary: `#ec4899` (rose-500)
- Secondary: `#f472b6` (rose-400)
- Background: `#fff1f2` (rose-50)
- Used throughout all components for consistency

## Database

### Schema Definition

```
backend/prisma/schema.prisma       # Full database schema
```

### Tables

1. **users** - User accounts and authentication
2. **articles** - Cached news articles
3. **summaries** - AI-generated article summaries
4. **bookmarks** - User's saved articles

## Quick Commands

### Backend

```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start dev server (port 5000)
npx prisma db push      # Initialize database
npx prisma studio      # Open database browser
```

### Frontend

```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start dev server (port 5173)
npm run build           # Production build
npm run preview         # Preview production build
```

## File Organization by Language

### TypeScript (.ts / .tsx)

**Backend** (5 main services + 4 controllers + 4 routes)

- Services: newsService, authService, summaryService, articleService
- Controllers: 4 main controllers handling routes
- Routes: 4 main route files

**Frontend** (17 total TypeScript files)

- Pages: 5 main pages
- Components: 4 reusable components
- Services: 5 API client files (apiClient + 4 domains)
- Context: 1 auth context
- Config: App.tsx, main.tsx, configuration files

### Configuration Files

- `package.json` - Both frontend and backend
- `tsconfig.json` - Both frontend and backend
- `.env` - Backend configuration
- `.env.local` - Frontend configuration
- `vite.config.ts` - Frontend build config
- `tailwind.config.js` - Frontend styling
- `postcss.config.js` - CSS processing

## Finding Specific Functionality

### "I need to modify how news is fetched"

→ `backend/src/services/newsService.ts`

### "I need to update the UI styling"

→ `frontend/src/index.css` (Tailwind), `tailwind.config.js` (colors)

### "I want to customize a component"

→ `frontend/src/components/*.tsx`

### "I need to add a new API endpoint"

→ `backend/src/routes/*.ts`, then create controller and service

### "I want to understand data flow"

→ Read `ARCHITECTURE.md`

### "I want to change the database"

→ Edit `backend/prisma/schema.prisma`, run `npx prisma db push`

### "I want to test the API"

→ Reference `API_DESIGN.md`, use curl or Postman

### "I need authentication logic"

→ `backend/src/services/authService.ts`

## Development Tools

### Required

- Node.js v16+
- PostgreSQL 12+
- VS Code (recommended) with extensions:
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense
  - Prisma
  - Thunder Client (API testing)

### Optional

- DBeaver (database viewer)
- Postman (API testing)
- React Developer Tools extension

## Production Build Output

### Frontend

```
frontend/dist/
├── index.html
├── assets/
│   ├── index-*.js       (JavaScript bundle)
│   └── index-*.css      (Compiled Tailwind CSS)

Size: 291.15 kB (92.89 kB gzipped)
```

### Backend

- Compiled TypeScript to JavaScript (if enabled)
- Ready to deploy to Node.js hosting

## Next Steps

1. **Quick Start**: Read `GETTING_STARTED.md`
2. **Understand Architecture**: Read `ARCHITECTURE.md`
3. **Explore Code**: Start with frontend `components/` directory
4. **Build Features**: Reference `BUILD_PLAN.md`
5. **Deploy**: Follow `README.md` deployment section
