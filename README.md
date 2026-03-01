# Smart Flight Crew Scheduling System ✈️

> An AI-powered full-stack web application that automates flight crew scheduling, conflict detection, and workload optimization — built as a Final Year BE AI & Data Science Project.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS v4 + Recharts |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT (JSON Web Tokens) |
| **Algorithms** | Rule-Based + AI Scoring Heuristics |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd retrograde-orbit
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crew_scheduling?schema=public"
JWT_SECRET="supersecretkey123"
PORT=5000
```

```bash
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 👤 User Roles & Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@airline.com | password123 |
| Scheduler | scheduler@airline.com | password123 |
| Pilot | pilot1@airline.com | password123 |
| Cabin Crew | cabin1@airline.com | password123 |

---

## 🧠 AI Scheduling Algorithm

```
Score = (Rest Compliance × 0.4) + (Workload Balance × 0.4) + (Availability × 0.2)
```

The system ranks all eligible crew by this score and assigns the highest scorer to each flight automatically.

---

## 📁 Project Structure

```
retrograde-orbit/
├── backend/
│   ├── src/
│   │   ├── algorithms/       # AI scheduling logic
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # JWT auth & role guards
│   │   ├── routes/           # API endpoints
│   │   └── services/         # Business logic
│   └── prisma/
│       ├── schema.prisma     # DB schema
│       └── seed.js           # Sample data seeder
└── frontend/
    └── src/
        ├── components/       # Shared UI (Sidebar, Layout)
        ├── context/          # Auth context
        ├── pages/            # All page components
        └── services/         # Axios API client
```

---

## 🔗 API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/flights | All authenticated |
| POST | /api/flights | Admin/Scheduler |
| GET | /api/crew | Admin/Scheduler |
| POST | /api/schedules/generate | Admin/Scheduler |
| GET | /api/schedules/conflicts | Admin/Scheduler |
| GET | /api/reports/utilization | Admin/Scheduler |
| GET | /api/reports/workload/download | Admin/Scheduler |

---

## 📄 License
MIT
