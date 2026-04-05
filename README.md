# NovaNews - AI-Enhanced News Portal

A full-stack personalized news dashboard with AI-powered summaries, built with TypeScript and modern web technologies.

## Overview

NovaNews is a production-ready web application that:

- Fetches latest global headlines from NewsAPI
- Displays interactive news cards with a modern, responsive interface
- Generates AI-powered article summaries using Google Gemini API
- Provides user authentication with secure JWT tokens
- Allows users to bookmark and organize articles
- Implements intelligent caching to optimize API costs
- Supports search and category filtering

## Tech Stack

### Frontend

- React 19 - UI framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first styling with rose theme
- Vite - Modern build tool
- React Router - Client-side routing
- Axios - HTTP client

### Backend

- Node.js - Runtime environment
- Express - Web framework
- PostgreSQL - Database
- Prisma - ORM for type-safe database queries
- JWT - Authentication tokens
- bcryptjs - Password hashing

### External APIs

- NewsAPI - News data fetching
- Google Gemini API - AI summarization

## Quick Start

### Prerequisites

- Node.js v16+
- PostgreSQL v12+
- API keys from NewsAPI and Google Gemini

### Backend Setup

```bash
cd backend
npm install

cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/novanews"
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NEWS_API_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:5173
EOF

npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_NEWS_IMAGE_FALLBACK=https://placehold.co/320x180?text=No+Image
EOF

npm run dev
```

### Verify Installation

```bash
curl http://localhost:5000/api/health
open http://localhost:5173
```

## Project Structure

```
ai_guild_app/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Auth & errors
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # TypeScript components (.tsx)
│   │   ├── pages/           # Full pages (.tsx)
│   │   ├── services/        # API clients (.ts)
│   │   ├── store/           # State management (.tsx)
│   │   └── App.tsx          # Main router
│   ├── tailwind.config.js   # Tailwind setup
│   ├── tsconfig.json        # TypeScript config
│   └── package.json
│
└── docs/
    ├── ARCHITECTURE.md      # System design
    ├── API_DESIGN.md        # API endpoints
    └── README.md            # This file
```

## API Documentation

Base URL: `http://localhost:5000/api`

**Authentication**

- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Current user (protected)

**News**

- `GET /news` - Headlines by category
- `POST /news/search` - Search articles
- `GET /news/categories` - Available categories

**Summaries**

- `POST /summary` - Generate summary (protected)
- `GET /summary/:url` - Get cached summary (protected)

**Bookmarks**

- `POST /articles` - Bookmark article (protected)
- `GET /articles` - User bookmarks (protected)
- `DELETE /articles/:id` - Remove bookmark (protected)

See [API_DESIGN.md](./API_DESIGN.md) for complete documentation.

## Database Schema

| Table     | Purpose        | Key Fields                                  |
| --------- | -------------- | ------------------------------------------- |
| users     | User accounts  | id, email, password, username, createdAt    |
| articles  | Cached news    | id, url, title, content, category, imageUrl |
| summaries | AI summaries   | id, articleUrl, summary, tokenUsage         |
| bookmarks | Saved articles | id, userId, articleUrl, notes, createdAt    |

## Development

### Frontend

- All components are TypeScript (.tsx)
- Styling: Tailwind CSS (no separate CSS files)
- Props: Use interfaces for type safety
- Hooks: Full TypeScript support for React hooks

### Backend

- Node.js/Express for API
- Prisma for database operations
- JWT middleware for protected routes
- Error handling middleware for consistency

### Running Development

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Build for Production

```bash
# Frontend
cd frontend && npm run build  # Creates dist/

# Backend
cd backend && npm run build   # Creates compiled JS
```

## Deployment

Frontend: Vercel, Netlify, or any static host
Backend: Render, Railway, or AWS
Database: Railway, AWS RDS, or Supabase

Set production environment variables on your hosting platform.

## Troubleshooting

**Port already in use**: Change PORT in .env or kill process

**Database connection failed**: Check PostgreSQL is running and DATABASE_URL is correct

**API key errors**: Verify keys in .env file and services are enabled

**Frontend not loading**: Check VITE_API_URL points to backend, backend is running

## Documentation

- [System Architecture](./ARCHITECTURE.md)
- [API Specification](./API_DESIGN.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Getting Started](./GETTING_STARTED.md)
