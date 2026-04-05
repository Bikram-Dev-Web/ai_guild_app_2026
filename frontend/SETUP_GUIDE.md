// Frontend React Setup and Components
// ============================================================

## 1. CREATE REACT APP

```bash
cd d:\Sigma-Web-Dev\ai_guild_app
npx create-react-app frontend
cd frontend

# Install additional dependencies
npm install axios react-router-dom
npm install dotenv

# Create folder structure
mkdir -p src/{components,pages,services,store,utils}
mkdir -p public/images
```

## 2. Frontend .env Setup

**File: `frontend/.env`**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NEWS_IMAGE_FALLBACK=https://via.placeholder.com/300x200?text=No+Image
```

## 3. Dependencies Explanation

- **axios**: HTTP client for API calls
- **react-router-dom**: Client-side routing
- **dotenv**: Load environment variables

## 4. Folder Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── NewsCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── SummaryLoader.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Header.jsx
│   │
│   ├── pages/                # Full page components
│   │   ├── HomePage.jsx
│   │   ├── MyLibrary.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── ProfilePage.jsx
│   │
│   ├── services/             # API client functions
│   │   ├── apiClient.js      # Axios instance with interceptors
│   │   ├── authAPI.js
│   │   ├── newsAPI.js
│   │   ├── summaryAPI.js
│   │   └── articleAPI.js
│   │
│   ├── store/                # Context (state management)
│   │   └── AuthContext.jsx
│   │
│   ├── utils/                # Helper functions
│   │   ├── tokenManager.js   # localStorage operations
│   │   └── formatters.js
│   │
│   ├── App.jsx               # Main router
│   ├── App.css               # Global styles
│   └── index.js              # React entry point
│
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── package.json
├── .env
└── .gitignore
```
