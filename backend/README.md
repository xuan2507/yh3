# LearnAI Backend

Node.js/Express REST API for the LearnAI study platform.

## Deploy to Render (Free)

### 1. Push to GitHub
```bash
git add backend/
git commit -m "Add LearnAI backend API"
git push origin main
```

### 2. Create PostgreSQL on Render
- Go to [render.com](https://render.com)
- New → PostgreSQL → Name: `learnai-db` → Region: closest to you → Create

### 3. Create Web Service
- New → Web Service → Connect your GitHub repo
- Name: `learnai-backend`
- Runtime: Node
- Build Command: `npm install && npm run db:init`
- Start Command: `npm start`
- Add Environment Variables:
  - `DATABASE_URL` = (copy from your PostgreSQL dashboard)
  - `JWT_SECRET` = (generate a random string)
  - `FRONTEND_URL` = `https://xuan2507.github.io`
- Create Web Service

### 4. Auto-Deploy
Render auto-deploys on every git push to main.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Quiz Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/results` | Save quiz result |
| GET | `/api/quizzes/results` | Get quiz history |
| GET | `/api/quizzes/stats` | Get quiz statistics |

### Mistakes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mistakes` | Add mistake |
| GET | `/api/mistakes` | List mistakes |
| PATCH | `/api/mistakes/:id/mastered` | Mark mastered |
| DELETE | `/api/mistakes/:id` | Delete mistake |
| GET | `/api/mistakes/patterns` | Get mistake patterns |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/goals` | Create goal |
| GET | `/api/goals` | List goals |
| PATCH | `/api/goals/:id/progress` | Update progress |
| DELETE | `/api/goals/:id` | Delete goal |

### Topic Mastery
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mastery` | Update mastery |
| GET | `/api/mastery/:subject` | Get subject mastery |
| GET | `/api/mastery/weak/:subject` | Get weak topics |

### Study Time
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study/time` | Log study time |
| GET | `/api/study/stats` | Get study stats |

### Tutor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tutor/messages` | Save message |
| GET | `/api/tutor/messages` | Get chat history |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions/memory-decay` | Get decay alerts |
| GET | `/api/predictions/exam/:subject` | Get exam predictions |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookmarks` | Add bookmark |
| GET | `/api/bookmarks` | List bookmarks |
| DELETE | `/api/bookmarks/:id` | Remove bookmark |

## Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

## Local Development
```bash
cd backend
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
npm install
npm run db:init
npm run dev
```
