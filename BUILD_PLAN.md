# 🛠️ NOVANEWS BUILD PLAN - STEP BY STEP

## Phase 1: Setup & Configuration (Day 1)

### Task 1.1: Initialize Node.js Backend

```bash
# Create backend directory
mkdir -p backend
cd backend

# Initialize Node project
npm init -y

# Install essential dependencies
npm install express dotenv cors axios bcryptjs jsonwebtoken
npm install prisma @prisma/client --save-dev

# Install dev tools for auto-restart during development
npm install nodemon --save-dev

# Create main file structure
mkdir -p src/{routes,controllers,services,models,middleware,config}
touch src/app.js src/server.js .env .gitignore
```

**WHY each dependency:**

- `express`: Web server framework
- `dotenv`: Load environment variables safely
- `cors`: Allow cross-domain requests from React frontend
- `axios`: Make HTTP calls to external APIs
- `bcryptjs`: Hash passwords securely
- `jsonwebtoken`: Generate & verify JWT tokens
- `prisma`: Database ORM (type-safe queries)

### Task 1.2: Initialize React Frontend

```bash
# Create frontend directory
cd ..
npx create-react-app frontend

# Install additional dependencies
cd frontend
npm install axios react-router-dom context-api
npm install dotenv  # For API endpoints

# Create folder structure inside src/
mkdir -p src/{components,pages,services,store}
```

### Task 1.3: Setup PostgreSQL

```bash
# Option A: Use Docker (recommended for local dev)
docker run --name novanews-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=novanews -p 5432:5432 -d postgres:15

# Option B: Install PostgreSQL locally
# Download from https://www.postgresql.org/download/

# Verify connection:
psql -U postgres -d novanews
```

### Task 1.4: Create `.env` Files

**Backend** (`backend/.env`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/novanews"

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# External APIs
NEWS_API_KEY=your_newsapi_key_from_https://newsapi.org
GEMINI_API_KEY=your_gemini_key_from_https://makersuite.google.com

# OAuth (optional for Phase 2)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend allowed origin (CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Phase 2: Database & ORM Setup (Day 1-2)

### Task 2.1: Initialize Prisma

```bash
cd backend

# Initialize Prisma with PostgreSQL
npx prisma init

# Edit .env to set DATABASE_URL
# Edit prisma/schema.prisma with our tables
```

### Task 2.2: Create Database Schema (see DATABASE_SCHEMA.md)

**File: `backend/prisma/schema.prisma`**

```prisma
// See DATABASE_SCHEMA.md for complete schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String
  // ... more fields
}

// ... other models
```

### Task 2.3: Run Migrations

```bash
# Create migration files
npx prisma migrate dev --name init

# Generate Prisma Client (TypeScript autocomplete)
npx prisma generate
```

---

## Phase 3: Backend API - Authentication (Day 2)

### Task 3.1: Create Auth Service

**File: `backend/src/services/AuthService.js`**

- Hash passwords with bcryptjs
- Generate JWT tokens
- Validate credentials

### Task 3.2: Create Auth Controller

**File: `backend/src/controllers/authController.js`**

- Handle `/api/auth/register` → Create new user
- Handle `/api/auth/login` → Return JWT token
- Handle `/api/auth/me` → Get current user (protected route)

### Task 3.3: Create Auth Routes

**File: `backend/src/routes/auth.routes.js`**

```javascript
POST /api/auth/register   → Register new user
POST /api/auth/login      → Login & get JWT
GET  /api/auth/me         → Get current user (needs JWT)
POST /api/auth/logout     → Clear token (client-side mainly)
```

### Task 3.4: Create JWT Middleware

**File: `backend/src/middleware/authMiddleware.js`**

- Verify JWT token in request headers
- Extract user ID from token
- Attach user to request (for protected routes)

---

## Phase 4: Backend API - News & Cache (Day 3)

### Task 4.1: Create News Service

**File: `backend/src/services/NewsService.js`**

- Call NewsAPI.org for headlines
- Cache results in PostgreSQL
- Implement 30-minute cache expiration

```javascript
// Pseudocode flow:
async function getHeadlines(category) {
  // Check DB: SELECT * FROM news_cache WHERE category=? AND created_at > NOW() - 30min
  if (cacheExists && !expired) {
    return cachedResults; // Hit! No API call needed
  }

  // Miss! Call external API
  const results = await axios.get("https://newsapi.org/v2/top-headlines", {
    category: category,
    apiKey: process.env.NEWS_API_KEY,
  });

  // Store in DB for next request
  await saveToCache(results);
  return results;
}
```

### Task 4.2: Create News Controller & Routes

**File: `backend/src/controllers/newsController.js`**

```javascript
GET  /api/news                    → Get all headlines
GET  /api/news?category=tech      → Filter by category
POST /api/news/search             → Search articles
```

---

## Phase 5: Backend API - AI Summaries (Day 3)

### Task 5.1: Create Summary Service

**File: `backend/src/services/SummaryService.js`**

- Call Gemini API for text summarization
- Cache summaries in DB (keyed by article URL)
- Don't summarize twice

```javascript
// Pseudocode:
async function getSummary(articleUrl, articleContent) {
  // Check if we already summarized this article
  const cached = await db.summary.findUnique({
    where: { articleUrl },
  });

  if (cached) return cached.summary; // Cache HIT

  // Call Gemini API
  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    {
      contents: [
        {
          parts: [
            {
              text: `Summarize in 2 sentences: ${articleContent}`,
            },
          ],
        },
      ],
    },
    {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY },
    },
  );

  const summary = response.data.candidates[0].content.parts[0].text;

  // Save for future requests
  await db.summary.create({
    data: { articleUrl, summary },
  });

  return summary;
}
```

### Task 5.2: Create Summary Controller & Routes

**File: `backend/src/controllers/summaryController.js`**

```javascript
POST /api/summary              → Generate/fetch summary
GET /api/summary/:articleId    → Get cached summary
```

---

## Phase 6: Backend API - User Articles Library (Day 4)

### Task 6.1: Create Article Service

**File: `backend/src/services/ArticleService.js`**

- Save article bookmark for user
- Remove bookmark
- Get user's library
- Query optimizations with proper indexes

### Task 6.2: Create Article Controller & Routes

**File: `backend/src/controllers/articleController.js`**

```javascript
POST   /api/articles             → Bookmark article for current user
DELETE /api/articles/:articleId  → Remove bookmark
GET    /api/articles             → Get user's library (paginated)
```

---

## Phase 7: Frontend - Basic Setup (Day 4-5)

### Task 7.1: Setup React Router

**File: `frontend/src/App.jsx`**

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/library" element={<MyLibrary />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Routes>
</BrowserRouter>
```

### Task 7.2: Setup Auth Context

**File: `frontend/src/store/AuthContext.jsx`**

- Store current user in React Context
- Store JWT token
- Provide logout function

### Task 7.3: Create API Client

**File: `frontend/src/services/apiClient.js`**

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Auto-attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Phase 8: Frontend - Components (Day 5-6)

### Task 8.1: NewsCard Component

**File: `frontend/src/components/NewsCard.jsx`**

- Display article title, image, description
- "Summarize" button
- "Bookmark" button

### Task 8.2: SearchBar Component

**File: `frontend/src/components/SearchBar.jsx`**

- Input field for search query
- Call `/api/news/search` on submit

### Task 8.3: CategoryFilter Component

**File: `frontend/src/components/CategoryFilter.jsx`**

- Buttons for: Technology, Science, Finance, etc.
- Update news feed when clicked

### Task 8.4: HomePage Component

**File: `frontend/src/pages/HomePage.jsx`**

- Show default headlines
- Include SearchBar + CategoryFilter
- Map over articles and render NewsCard
- Handle loading states

---

## Phase 9: Frontend - User Features (Day 6-7)

### Task 9.1: Authentication Pages

**File: `frontend/src/pages/LoginPage.jsx`**

- Email/password form
- Call `/api/auth/login`
- Save JWT to localStorage
- Redirect to home

**File: `frontend/src/pages/SignupPage.jsx`**

- Similar to login but calls `/api/auth/register`

### Task 9.2: My Library Page

**File: `frontend/src/pages/MyLibrary.jsx`**

- Call `/api/articles` (protected route)
- Show user's bookmarked articles
- Allow delete/unbookmark

### Task 9.3: Profile Page

**File: `frontend/src/pages/ProfilePage.jsx`**

- Show user info
- Edit preferences
- Logout button

---

## Phase 10: Connecting Frontend & Backend (Day 7)

### Task 10.1: Test Full Auth Flow

1. Frontend: User signup → Backend creates user → JWT returned
2. Frontend: Store JWT → Attach to all requests
3. Frontend: Navigate to protected page → Backend verifies JWT

### Task 10.2: Test News Fetching

1. Frontend: Hit search → Backend calls NewsAPI
2. Backend: Cache results in DB
3. Second search → Return from cache (no API call!)

### Task 10.3: Test Summary Generation

1. Frontend: Click "Summarize" → Loading spinner
2. Backend: Check cache first
3. If miss: Call Gemini API, cache result
4. Return to frontend → Display summary

---

## Phase 11: Refinement & Production (Day 8+)

### Task 11.1: Error Handling

- Wrap all API calls in try-catch
- Show user-friendly error messages
- Log errors to console (frontend) + file (backend)

### Task 11.2: Performance

- Paginate article results (e.g., 20 per page)
- Lazy-load images
- Implement request debouncing for search

### Task 11.3: Validation

- Validate email format before API calls
- Validate password strength (frontend + backend)
- Sanitize all inputs (prevent XSS/injection)

### Task 11.4: Testing

- Write unit tests for services
- Test API endpoints with Postman/Thunder Client
- Test user flows manually

### Task 11.5: Deployment

- Deploy backend to Heroku / Railway / Render
- Deploy frontend to Vercel / Netlify
- Configure environment variables in hosting
- Set up HTTPS and CORS properly

---

## ⏱️ TIMELINE SUMMARY

| Phase     | Task                  | Duration      | Cumulative           |
| --------- | --------------------- | ------------- | -------------------- |
| 1         | Setup & Config        | 2 hours       | Day 1                |
| 2         | Database Setup        | 2 hours       | Day 1                |
| 3         | Auth Backend          | 3 hours       | Day 2                |
| 4         | News Backend          | 2 hours       | Day 3                |
| 5         | Summary Backend       | 2 hours       | Day 3                |
| 6         | Articles Backend      | 2 hours       | Day 4                |
| 7         | Frontend Setup        | 2 hours       | Day 4                |
| 8         | Frontend Components   | 4 hours       | Day 6                |
| 9         | Frontend Auth + Pages | 4 hours       | Day 7                |
| 10        | Integration Testing   | 3 hours       | Day 7                |
| 11        | Polish + Deployment   | 4+ hours      | Day 8+               |
| **Total** | **Full App**          | **~30 hours** | **Production Ready** |

---

## 🎯 Key Decisions & Why

### Sequential vs. Parallel Development?

✅ **Sequential** (which we follow):

- Backend first (requires DB schema)
- Then frontend (calls backend APIs)
- Tests as we go

❌ Parallel would mean frontend devs guess API contracts

### Testing After Implementation?

✅ Better approach:

- Test each API endpoint IMMEDIATELY after coding
- Use Postman to verify before frontend calls it

### Cache at DB Level First?

✅ Yes:

- Simple, no Redis setup needed
- Still very fast
- Add Redis later if needed

### JWT vs OAuth-only?

✅ Use both:

- JWT for backend token management
- OAuth for user convenience (one-click login)
