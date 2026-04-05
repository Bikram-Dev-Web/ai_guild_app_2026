// ============================================================
// BACKEND SETUP - Complete Step-by-Step
// ============================================================

## 1. Initialize Backend Project

```bash
cd d:\Sigma-Web-Dev\ai_guild_app

# Create backend folder
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express dotenv cors axios bcryptjs jsonwebtoken nodemon openai
npm install prisma @prisma/client --save-dev

# Create folder structure
mkdir -p src/routes src/controllers src/services src/middleware src/config
mkdir -p prisma

# Create key files
touch src/app.js src/server.js .env .gitignore
```

### Install Explanations:

- **express**: Web framework
- **dotenv**: Load env variables from .env file
- **cors**: Enable cross-origin requests (React at :3000 → Backend at :5000)
- **axios**: HTTP client (call NewsAPI, Gemini)
- **bcryptjs**: Hash passwords securely
- **jsonwebtoken**: Create JWT tokens
- **prisma**: ORM for database
- **@prisma/client**: Prisma runtime
- **nodemon**: Auto-restart server on file changes (dev tool)
- **openai**: OpenAI API client

---

## 2. Create .env File

**File: `backend/.env`**

```env
# ============ SERVER CONFIG ============
PORT=5000
NODE_ENV=development

# ============ DATABASE ============
DATABASE_URL="postgresql://postgres:password@localhost:5432/novanews"

# ============ JWT SECRETS ============
JWT_SECRET=your_super_secret_key_123456_change_in_production
JWT_EXPIRE=7d

# ============ EXTERNAL APIS ============
NEWS_API_KEY=get_from_https://newsapi.org
GEMINI_API_KEY=get_from_https://makersuite.google.com/app/apikey

# ============ SECURITY ============
FRONTEND_URL=http://localhost:3000
```

**Where to get API keys:**

- NewsAPI: https://newsapi.org/register (free tier = 100 requests/day)
- Gemini: https://makersuite.google.com/app/apikey (free tier = 60 requests/minute)

---

## 3. Update package.json Scripts

**File: `backend/package.json`**

```json
{
  "name": "novanews-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "axios": "^1.4.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "@prisma/client": "^5.0.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "prisma": "^5.0.0"
  }
}
```

Then run:

```bash
npm install
```

---

## 4. Initialize Prisma

```bash
npx prisma init
```

This creates:

- `.env` (update with DATABASE_URL)
- `prisma/schema.prisma` (database schema)

---

## 5. Configure Prisma Schema

**File: `backend/prisma/schema.prisma`**

(Copied from DATABASE_SCHEMA.md - full schema provided there)

Then run:

```bash
# Setup database tables
npx prisma db push

# Or create migration (for version control)
npx prisma migrate dev --name init
```
