# 🔌 API DESIGN SPECIFICATION

All API endpoints return JSON. Base URL: `http://localhost:5000/api`

---

## 1. AUTHENTICATION ENDPOINTS

### POST `/api/auth/register`

**Create a new user account**

**Request:**

```json
{
  "email": "alice@example.com",
  "password": "SecurePass123!",
  "username": "Alice"
}
```

**Validation:**

- `email`: Valid email format, no duplicates
- `password`: Minimum 8 characters, at least 1 uppercase, 1 number
- `username`: 3-50 characters, alphanumeric

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "alice@example.com",
    "username": "Alice",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### POST `/api/auth/login`

**Authenticate user and return JWT token**

**Request:**

```json
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "alice@example.com",
      "username": "Alice"
    }
  }
}
```

**Frontend usage:** Save token to localStorage

```javascript
localStorage.setItem("authToken", response.data.data.token);
```

**Error (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### GET `/api/auth/me`

**Get current logged-in user (Protected Route)**

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "alice@example.com",
    "username": "Alice",
    "createdAt": "2025-01-15T10:30:00Z",
    "lastLogin": "2025-01-16T14:22:00Z"
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid or missing token"
}
```

---

### POST `/api/auth/logout`

**Logout (mostly client-side, but here for completeness)**

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Frontend:** After logout, clear localStorage

```javascript
localStorage.removeItem("authToken");
```

---

## 2. NEWS ENDPOINTS

### GET `/api/news`

**Get cached headlines (with optional filters)**

**Query Parameters:**

```
?category=technology
?limit=20
?page=1
```

**Categories:** technology, science, finance, health, sports, entertainment, business, general

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 101,
        "title": "AI Breakthrough: New Model Achieves 99% Accuracy",
        "description": "Researchers announce a major advancement...",
        "author": "Jane Smith",
        "source": "TechCrunch",
        "imageUrl": "https://images.techcrunch.com/ai.jpg",
        "category": "technology",
        "url": "https://techcrunch.com/2025/01/15/ai-breakthrough",
        "publishedAt": "2025-01-15T08:00:00Z",
        "createdAt": "2025-01-15T08:30:00Z"
      },
      {
        "id": 102,
        "title": "COVID-19 Variant Detected in 5 Countries",
        "description": "Health organizations report...",
        "author": "Dr. Smith",
        "source": "BBC News",
        "imageUrl": "https://images.bbc.co.uk/health.jpg",
        "category": "health",
        "url": "https://bbc.com/news/health",
        "publishedAt": "2025-01-14T18:00:00Z",
        "createdAt": "2025-01-14T18:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 250,
      "totalPages": 13
    }
  }
}
```

**Why pagination?**

- Don't load 1000 articles at once (slow frontend)
- Each page = 20 articles (configurable)
- Frontend requests `/api/news?page=2` for next batch

---

### POST `/api/news/search`

**Search articles by keyword**

**Request:**

```json
{
  "query": "artificial intelligence",
  "limit": 20,
  "page": 1
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        /* article objects */
      }
    ],
    "pagination": {
      /* pagination info */
    }
  }
}
```

**Behind the scenes:**

1. Backend checks if articles matching "artificial intelligence" exist in cache
2. If cache miss (> 30 min old): Fetch from NewsAPI.org
3. Store fetched articles in DB
4. Return results

**This saves API calls!** (NewsAPI has rate limits)

---

## 3. SUMMARY ENDPOINTS

### POST `/api/summary`

**Generate or fetch AI summary for an article (Protected Route)**

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "articleUrl": "https://techcrunch.com/2025/01/15/ai-breakthrough",
  "articleContent": "Full article text here..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": "Researchers achieved a major AI breakthrough with a new model reaching 99% accuracy. The advancement could accelerate machine learning applications across multiple industries.",
    "source": "cached", // "cached" or "generated"
    "model": "gemini-pro",
    "tokenUsage": 247
  }
}
```

**Response times:**

- **Cache HIT** (already summarized): ~50ms
- **Cache MISS** (first time): ~2-5 seconds (Gemini API call)

**Why this is important:** Caching = faster UX + lower API costs!

---

### GET `/api/summary/:articleId`

**Get summary for specific article (Protected Route)**

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": "...",
    "model": "gemini-pro",
    "createdAt": "2025-01-15T08:35:00Z"
  }
}
```

---

## 4. ARTICLE/BOOKMARK ENDPOINTS

### POST `/api/articles`

**Bookmark an article for current user (Protected Route)**

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "articleId": 101,
  "notes": "Great overview of AI trends"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Article bookmarked",
  "data": {
    "bookmarkId": 1,
    "userId": 1,
    "articleId": 101,
    "createdAt": "2025-01-15T14:00:00Z"
  }
}
```

**Error (409 Conflict):**

```json
{
  "success": false,
  "error": "Article already bookmarked"
}
```

---

### GET `/api/articles`

**Get all bookmarked articles for current user (Protected Route)**

**Query Parameters:**

```
?limit=20
?page=1
?sortBy=newest  // Options: newest, oldest, title
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "bookmarkId": 1,
        "article": {
          "id": 101,
          "title": "AI Breakthrough: New Model Achieves 99% Accuracy",
          "description": "...",
          "imageUrl": "https://...",
          "source": "TechCrunch",
          "url": "https://techcrunch.com/2025/01/15/ai-breakthrough",
          "publishedAt": "2025-01-15T08:00:00Z"
        },
        "notes": "Great overview of AI trends",
        "bookmarkedAt": "2025-01-15T14:00:00Z"
      }
    ],
    "pagination": {
      /* pagination */
    }
  }
}
```

---

### DELETE `/api/articles/:bookmarkId`

**Remove article from bookmarks (Protected Route)**

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Article removed from library"
}
```

**Error (404 Not Found):**

```json
{
  "success": false,
  "error": "Bookmark not found"
}
```

---

### GET `/api/articles/:articleId/check-bookmark`

**Check if user has bookmarked an article (Protected Route)**

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "bookmarkId": 1
  }
}
```

---

## 5. ERROR HANDLING

All endpoints follow this error format:

```json
{
  "success": false,
  "error": "Description of what went wrong",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code | Meaning      | Example                             |
| ---- | ------------ | ----------------------------------- |
| 200  | OK           | Request succeeded                   |
| 201  | Created      | Resource created (bookmark, user)   |
| 400  | Bad Request  | Invalid input (email format wrong)  |
| 401  | Unauthorized | Missing/invalid JWT token           |
| 404  | Not Found    | Article doesn't exist               |
| 409  | Conflict     | Duplicate email, already bookmarked |
| 500  | Server Error | Backend crashed                     |

---

## 6. AUTHENTICATION HEADER PATTERN

**Every protected route needs:**

```
GET /api/articles
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Frontend Interceptor (axios):**

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 7. RATE LIMITING (For Production)

To avoid abuse:

```
- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 1000 requests/minute per user
- External API calls: Queued (avoid hitting NewsAPI limits)
```

Implementation:

```javascript
// In middleware
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## 8. CORS CONFIGURATION

**Frontend at** `http://localhost:3000`  
**Backend at** `http://localhost:5000`

**Backend must allow cross-domain requests:**

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // http://localhost:3000
    credentials: true,
  }),
);
```

---

## 9. API DOCUMENTATION FOR TESTING

### Tool: Postman / Thunder Client

**Import this into Postman:**

```json
{
  "info": {
    "name": "NovaNews API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/register"
      }
    },
    {
      "name": "Get Headlines",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/news?category=technology"
      }
    }
  ]
}
```

---

## 10. TESTING CHECKLIST

Test each endpoint locally before connecting frontend:

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Secure123","username":"Test"}'

# 2. Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Secure123"}'

# 3. Get headlines
curl http://localhost:5000/api/news?category=technology

# 4. Protected route (use token from login)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```
