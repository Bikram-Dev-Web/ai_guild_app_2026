# 🗄️ DATABASE SCHEMA - Complete Design

## Overview

NovaNews has **4 main tables**:

1. **users** - User accounts and authentication
2. **articles** - News articles (fetched from NewsAPI, cached locally)
3. **summaries** - AI-generated summaries (cached by article URL)
4. **bookmarks** - Which articles each user has saved

### Relationship Diagram

```
users (1) ─────────→ (many) bookmarks
              ↑                    │
              │                    ↓
              └────────────── articles

articles (1) ─────────→ (many) summaries
                    (article URL)
```

---

## 1. `users` Table

**Purpose**: Store user accounts and credentials

| Column        | Type           | Constraints                 | Purpose                               |
| ------------- | -------------- | --------------------------- | ------------------------------------- |
| `id`          | `INT`          | PRIMARY KEY, AUTO_INCREMENT | Unique user ID                        |
| `email`       | `VARCHAR(255)` | UNIQUE, NOT NULL            | Email (login credential)              |
| `password`    | `VARCHAR(255)` | NOT NULL                    | Bcrypt hashed password                |
| `username`    | `VARCHAR(100)` |                             | Display name                          |
| `created_at`  | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP   | Account creation date                 |
| `updated_at`  | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP   | Last profile update                   |
| `last_login`  | `TIMESTAMP`    |                             | Track user activity                   |
| `preferences` | `JSON`         |                             | User settings (theme, language, etc.) |

### Why these fields?

| Field                      | Why                                             |
| -------------------------- | ----------------------------------------------- |
| `email` UNIQUE             | Prevent duplicate accounts                      |
| `password` hashed          | Never store plaintext! Use bcryptjs             |
| `preferences` JSON         | Flexible future settings without schema changes |
| `created_at`, `updated_at` | Track data lifecycle (debugging, analytics)     |
| `last_login`               | Know if user is active                          |

### Example Data

```json
{
  "id": 1,
  "email": "alice@example.com",
  "password": "$2b$10$abcdef...", // Hashed with bcrypt
  "username": "Alice",
  "created_at": "2025-01-15T10:30:00Z",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  }
}
```

---

## 2. `articles` Table

**Purpose**: Cache news articles locally (avoid repeated NewsAPI calls)

| Column         | Type           | Constraints                 | Purpose                                  |
| -------------- | -------------- | --------------------------- | ---------------------------------------- |
| `id`           | `INT`          | PRIMARY KEY, AUTO_INCREMENT | Unique article ID                        |
| `url`          | `VARCHAR(500)` | UNIQUE                      | Original article URL                     |
| `title`        | `VARCHAR(255)` | NOT NULL                    | Article headline                         |
| `description`  | `TEXT`         |                             | Short preview                            |
| `content`      | `TEXT`         |                             | Full article content (for summarization) |
| `author`       | `VARCHAR(255)` |                             | Original author                          |
| `image_url`    | `VARCHAR(500)` |                             | Thumbnail/hero image                     |
| `source`       | `VARCHAR(100)` |                             | e.g., "BBC News", "TechCrunch"           |
| `category`     | `VARCHAR(50)`  |                             | "technology", "science", "finance", etc. |
| `published_at` | `TIMESTAMP`    |                             | When article was published               |
| `created_at`   | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP   | When we cached it                        |
| `updated_at`   | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP   | Cache refresh time                       |

### Indexes (for fast queries)

```sql
CREATE INDEX idx_url ON articles(url);
CREATE INDEX idx_category ON articles(category);
CREATE INDEX idx_created_at ON articles(created_at DESC);  -- For sorting by "newest"
CREATE INDEX idx_source ON articles(source);
```

### Why?

- **UNIQUE url**: Prevent duplicate articles in cache
- **content field**: Used when generating summaries
- **category**: Filter by Technology, Science, etc.
- **created_at DESC index**: Fast "get latest 20 articles" queries
- **published_at**: Sort by actual publication time

### Example Data

```json
{
  "id": 101,
  "url": "https://techcrunch.com/2025/01/15/ai-breakthrough",
  "title": "Breakthrough in AI: New Model Achieves 99% Accuracy",
  "description": "Researchers announce a major advancement in machine learning...",
  "content": "Full article text here for summarization...",
  "author": "Jane Smith",
  "image_url": "https://images.techcrunch.com/ai-article.jpg",
  "source": "TechCrunch",
  "category": "technology",
  "published_at": "2025-01-15T08:00:00Z",
  "created_at": "2025-01-15T08:30:00Z"
}
```

---

## 3. `summaries` Table

**Purpose**: Cache AI-generated summaries (keyed by article URL)

| Column          | Type           | Constraints                 | Purpose                                                |
| --------------- | -------------- | --------------------------- | ------------------------------------------------------ |
| `id`            | `INT`          | PRIMARY KEY, AUTO_INCREMENT | Unique summary ID                                      |
| `article_url`   | `VARCHAR(500)` | UNIQUE, NOT NULL            | FK to articles.url                                     |
| `summary`       | `TEXT`         | NOT NULL                    | 2-sentence AI summary                                  |
| `summary_model` | `VARCHAR(50)`  |                             | Which LLM generated this ("gemini-pro", "gpt-4", etc.) |
| `created_at`    | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP   | When summary was generated                             |
| `token_usage`   | `INT`          |                             | Track API costs (Gemini/OpenAI charges per token)      |

### Why this design?

| Decision              | Why                                                                |
| --------------------- | ------------------------------------------------------------------ |
| `article_url` as FK   | Link to articles table (unique lookup by URL)                      |
| `summary_model` field | Track which AI model generated it (for debugging, cost accounting) |
| `token_usage`         | Monitor API spending and identify expensive articles               |
| UNIQUE url            | One summary per article (no redundant LLM calls)                   |

### Example Data

```json
{
  "id": 200,
  "article_url": "https://techcrunch.com/2025/01/15/ai-breakthrough",
  "summary": "Researchers achieved a major AI breakthrough with a new model reaching 99% accuracy. The advancement could accelerate machine learning applications across multiple industries.",
  "summary_model": "gemini-pro",
  "created_at": "2025-01-15T08:35:00Z",
  "token_usage": 247 // Tokens used by Gemini API
}
```

---

## 4. `bookmarks` Table

**Purpose**: Track which articles each user has saved

| Column       | Type        | Constraints                 | Purpose                            |
| ------------ | ----------- | --------------------------- | ---------------------------------- |
| `id`         | `INT`       | PRIMARY KEY, AUTO_INCREMENT | Unique bookmark ID                 |
| `user_id`    | `INT`       | FK to users.id, NOT NULL    | Which user saved it                |
| `article_id` | `INT`       | FK to articles.id, NOT NULL | Which article                      |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP   | When bookmarked                    |
| `notes`      | `TEXT`      |                             | Optional user notes on the article |

### Constraints

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
UNIQUE (user_id, article_id);  -- User can't bookmark same article twice
```

### Indexes

```sql
CREATE INDEX idx_user_id ON bookmarks(user_id);
CREATE INDEX idx_article_id ON bookmarks(article_id);
CREATE INDEX idx_user_created ON bookmarks(user_id, created_at DESC);  -- Fast "get user's bookmarks sorted by date"
```

### Example Data

```json
{
  "id": 1,
  "user_id": 1,
  "article_id": 101,
  "created_at": "2025-01-15T09:00:00Z",
  "notes": "Great overview of AI trends"
}
```

---

## Full Prisma Schema

**File: `backend/prisma/schema.prisma`**

```prisma
// This is your ORM definition - Prisma converts this to SQL

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============ USERS ============
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String
  username  String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  lastLogin DateTime? @map("last_login")
  preferences Json?

  // Relations
  bookmarks Bookmark[]

  @@map("users")
}

// ============ ARTICLES ============
model Article {
  id        Int     @id @default(autoincrement())
  url       String  @unique
  title     String
  description String?
  content   String?
  author    String?
  imageUrl  String? @map("image_url")
  source    String
  category  String
  publishedAt DateTime? @map("published_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  summaries Summary[]
  bookmarks Bookmark[]

  @@index([category])
  @@index([createdAt(sort: Desc)])
  @@index([source])
  @@map("articles")
}

// ============ SUMMARIES ============
model Summary {
  id        Int     @id @default(autoincrement())
  articleUrl String  @unique @map("article_url")
  summary   String
  summaryModel String? @map("summary_model")
  createdAt DateTime @default(now()) @map("created_at")
  tokenUsage Int? @map("token_usage")

  // Relation (note: this is a manual FK since we use url)
  article Article? @relation(fields: [articleUrl], references: [url], onDelete: Cascade)

  @@map("summaries")
}

// ============ BOOKMARKS ============
model Bookmark {
  id        Int     @id @default(autoincrement())
  userId    Int     @map("user_id")
  articleId Int     @map("article_id")
  createdAt DateTime @default(now()) @map("created_at")
  notes     String?

  // Relations
  user Article?
 article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])  // User can't bookmark same article twice
  @@index([userId])
  @@index([articleId])
  @@index([userId, createdAt(sort: Desc)])
  @@map("bookmarks")
}
```

---

## SQL Creation Script (If Not Using Prisma)

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  preferences JSONB
);

-- Create articles table
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  author VARCHAR(255),
  image_url VARCHAR(500),
  source VARCHAR(100),
  category VARCHAR(50),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on articles
CREATE INDEX idx_url_articles ON articles(url);
CREATE INDEX idx_category ON articles(category);
CREATE INDEX idx_created_at_desc ON articles(created_at DESC);
CREATE INDEX idx_source ON articles(source);

-- Create summaries table
CREATE TABLE summaries (
  id SERIAL PRIMARY KEY,
  article_url VARCHAR(500) UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  summary_model VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  token_usage INT,
  FOREIGN KEY (article_url) REFERENCES articles(url) ON DELETE CASCADE
);

-- Create bookmarks table
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE (user_id, article_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Create indexes on bookmarks
CREATE INDEX idx_user_id_bookmarks ON bookmarks(user_id);
CREATE INDEX idx_article_id_bookmarks ON bookmarks(article_id);
CREATE INDEX idx_user_created ON bookmarks(user_id, created_at DESC);
```

---

## Common Query Patterns

### 1. Get all bookmarks for a user

```sql
SELECT a.* FROM articles a
JOIN bookmarks b ON a.id = b.article_id
WHERE b.user_id = 1
ORDER BY b.created_at DESC
LIMIT 20;
```

### 2. Get cached articles by category

```sql
SELECT * FROM articles
WHERE category = 'technology'
AND created_at > NOW() - INTERVAL '30 minutes'  -- Cache expiry
ORDER BY created_at DESC;
```

### 3. Get summary for an article (if exists)

```sql
SELECT * FROM summaries
WHERE article_url = 'https://example.com/news/123'
LIMIT 1;
```

### 4. Check if user already bookmarked an article

```sql
SELECT EXISTS (
  SELECT 1 FROM bookmarks
  WHERE user_id = 1 AND article_id = 101
);
```

---

## Prisma Usage Examples

### Create a new user

```javascript
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    password: hashedPassword,
    username: "alice",
  },
});
```

### Get user with all bookmarks

```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    bookmarks: {
      include: { article: true },
      orderBy: { createdAt: "desc" },
      take: 20, // Pagination limit
    },
  },
});
```

### Create a bookmark

```javascript
const bookmark = await prisma.bookmark.create({
  data: {
    userId: 1,
    articleId: 101,
    notes: "Good read",
  },
});
```

### Cache articles

```javascript
await prisma.article.createMany({
  data: articlesFromNewsAPI,
  skipDuplicates: true, // Ignore if URL already exists
});
```
