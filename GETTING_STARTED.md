# Getting Started with NovaNews

Complete your NovaNews setup in less than 15 minutes.

## Prerequisites

- Node.js v16+
- PostgreSQL v12+
- API keys:
  - NewsAPI: https://newsapi.org
  - Google Gemini: https://makersuite.google.com/app/apikey

## Backend Setup (5 minutes)

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/novanews"
JWT_SECRET=your_super_secret_key_here_change_it
JWT_EXPIRE=7d
NEWS_API_KEY=your_newsapi_key_here
GEMINI_API_KEY=your_gemini_key_here
FRONTEND_URL=http://localhost:5173
EOF

# 3. Initialize database
npx prisma db push

# 4. Start server
npm run dev
# Server running at http://localhost:5000
```

## Frontend Setup (5 minutes)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create environment file
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_NEWS_IMAGE_FALLBACK=https://placehold.co/320x180?text=No+Image
EOF

# 3. Start development server
npm run dev
# Frontend running at http://localhost:5173
```

## Verification

Open a new terminal and run:

```bash
# Test backend
curl http://localhost:5000/api/health

# Register test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "username": "TestUser"
  }'

# Open frontend
open http://localhost:5173
```

## What You Get

- News dashboard showing latest headlines
- Search and category filtering
- AI-powered article summaries
- Bookmark saved articles
- User authentication and profiles
- Modern rose-themed UI with Tailwind CSS

## Next Steps

1. Create your user account at http://localhost:5173
2. Browse archived news
3. Try summarizing an article
4. Bookmark your favorites
5. Explore your profile

## Troubleshooting

**Database connection error:**

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npx prisma db push` again

**Frontend blank screen:**

- Check browser console for errors
- Verify backend is running on port 5000
- Check VITE_API_URL in .env.local

**API key errors:**

- Confirm keys are in .env file
- Check keys are valid and active
- Verify services are enabled in Google Cloud

## Resources

- [Complete Documentation](./README.md)
- [System Architecture](./ARCHITECTURE.md)
- [API Reference](./API_DESIGN.md)
