# NovaNews - System Architecture

## Overview

NovaNews is a full-stack news aggregation platform with AI-powered summaries. The architecture separates concerns across frontend, backend, and database layers with clear interfaces between each.

## System Flow

```
Client Browser (React + TypeScript)
    ↓ HTTP/REST + JWT
Backend API (Node.js + Express + TypeScript)
    ↓ SQL Queries
PostgreSQL Database

External Services:
- NewsAPI → Latest headlines
- Google Gemini API → AI summaries
```

## Frontend (React + TypeScript + Tailwind CSS)

### Technology Stack

- **React 19**: Component framework
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first styling with custom rose theme
- **React Router**: SPA routing
- **Axios**: HTTP client
- **Vite**: Build tool (dev server on port 5173)

### Rose Theme Design

The frontend uses a carefully chosen rose color palette:

- **Primary**: `#ec4899` (rose-500)
- **Secondary**: `#f472b6` (rose-400)
- **Background**: `#fff1f2` (rose-50)
- **Cards**: White with rose accents and subtle shadows
- **Borders**: Rose on focus states

### Component Structure

```
src/
├── components/          # Reusable UI components (.tsx)
│   ├── NewsCard.tsx    # Individual news article card
│   ├── SearchBar.tsx   # Search input with rose styling
│   ├── CategoryFilter.tsx  # Category selection
│   └── SummaryLoader.tsx   # Loading spinner
├── pages/              # Full pages (.tsx)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── MyLibraryPage.tsx
│   └── ProfilePage.tsx
├── services/           # API clients (.ts)
│   ├── apiClient.ts    # Axios instance
│   ├── authAPI.ts      # Auth endpoints
│   ├── newsAPI.ts      # News endpoints
│   ├── summaryAPI.ts   # Summary endpoints
│   └── articleAPI.ts   # Bookmark endpoints
├── store/              # State management
│   └── AuthContext.tsx # Global auth state
├── App.tsx            # Main router
└── index.css          # Tailwind directives
```

### Styling Approach

- **No separate CSS files**: All styling via Tailwind classes
- **Custom components**: Rose-themed buttons, cards, and form inputs registered in `index.css`
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Consistent**: Rose theme applied throughout via `tailwind.config.js`

### Key TypeScript Interfaces

```typescript
// Articles
interface Article {
  source: { id: string; name: string }
  author: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  content: string
}

// Users
interface User {
  id: string
  email: string
  username: string
  createdAt: Date
}

// Summaries
interface Summary {

## Backend (Node.js + Express + TypeScript)

### Technology Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for HTTP endpoints
- **TypeScript**: Type-safe server code
- **Prisma**: Type-safe ORM for database operations
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing

### Project Structure

```

backend/src/
├── routes/ # Express route definitions
│ ├── auth.ts # Authentication endpoints
│ ├── news.ts # News endpoints
│ ├── summary.ts # Summary endpoints
│ └── articles.ts # Bookmark endpoints
├── controllers/ # Request handlers
├── services/ # Business logic
├── middleware/ # Auth, error handling, validation
└── app.ts # Express setup

````

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /auth/register | Create account |
| POST | /auth/login | Get JWT token |
| GET | /auth/me | Current user (protected) |
| GET | /news | Headlines by category |
| POST | /news/search | Search articles |
| GET | /news/categories | Available categories |
| POST | /summary | Generate AI summary (protected) |
| GET | /summary/:url | Get cached summary (protected) |
| POST | /articles | Bookmark article (protected) |
| GET | /articles | User bookmarks (protected) |
| DELETE | /articles/:id | Remove bookmark (protected) |

## Database (PostgreSQL + Prisma)

### Schema Overview

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  username  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  articles  Article[]
  bookmarks Bookmark[]
}

model Article {
  id        String    @id @default(cuid())
  url       String    @unique
  title     String
  content   String
  category  String
  imageUrl  String?
  createdAt DateTime  @default(now())
  summaries Summary[]
  bookmarks Bookmark[]
}

model Summary {
  id         String    @id @default(cuid())
  articleUrl String
  summary    String
  tokenUsage Int
  createdAt  DateTime  @default(now())
  article    Article   @relation(fields: [articleUrl], references: [url])
}

model Bookmark {
  id        String    @id @default(cuid())
  userId    String
  articleUrl String
  notes     String?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id])
  article   Article   @relation(fields: [articleUrl], references: [url])
}
````

### Key Indexes

- `idx_user_email` on users(email)
- `idx_article_url` on articles(url)
- `idx_summary_articleUrl` on summaries(articleUrl)

## Data Flow

### User Search and Summarization

```
1. User searches for "AI" in frontend
2. Frontend sends: POST /api/news/search?q=AI
3. Backend NewsController checks cache
4. If not cached: Call NewsAPI, store in DB
5. Frontend receives articles, user clicks "Summarize"
6. Frontend sends: POST /api/summary with article URL
7. Backend SummaryController checks cache
8. If not cached: Call Gemini API, store in DB
9. Frontend displays summary
```

## Authentication

- **Registration**: Password hashed with bcryptjs
- **Login**: Returns JWT valid for 7 days
- **Protected Routes**: Middleware verifies JWT on every request
- **Token Storage**: Stored in browser localStorage

## Caching Strategy

- **Article Cache**: 30-minute TTL in database
- **Summary Cache**: Permanent (one per article URL)
- **Session Cache**: Browser localStorage
- **Cost Optimization**: Prevents duplicate API calls
