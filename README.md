<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=700&size=28&pause=1000&color=0EA5E9&center=true&vCenter=true&width=600&lines=SmartCrew+✈️;Aviation+Operations+Center;AI-Powered+Crew+Scheduling" alt="SmartCrew" />

<br/>

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Active-10b981?style=flat-square" />
  <img src="https://img.shields.io/badge/Project-Final%20Year%20AI%20%26%20DS-a78bfa?style=flat-square" />
</p>

> **An AI-powered full-stack aviation crew scheduling system** — automating crew assignment, conflict detection, duty compliance, and flight operations management for airlines. Built as a Final Year B.E. AI & Data Science Project.

</div>

---

## 📸 Preview

| Login Portal | Admin Dashboard | Live Flight Board |
|:---:|:---:|:---:|
| Aviation-themed dark UI with runway animation | Animated stats, PieChart, activity feed | FIDS airport-style departure board |

| Flight Management | Crew Dashboard | Notifications |
|:---:|:---:|:---:|
| Boarding-pass style cards | Animated duty bar & next flight countdown | Type-filtered notification inbox |

---

## ✨ Features

### 🛡️ Role-Based Access Control
Three distinct portals with protected routes and JWT authentication:

| Role | Access |
|---|---|
| **Admin** | Full control — crew, flights, rules, reports, analytics |
| **Scheduler** | Auto-generate schedules, view & resolve conflicts |
| **Crew** | Personal schedule, duty tracker, availability management |

### 🤖 AI Scheduling Engine
Multi-factor crew scoring algorithm:
```
Score = (Rest Compliance × 0.35) + (Workload Balance × 0.35)
      + (Availability × 0.15) + (Qualification Match × 0.15)
```
- Respects **Min Rest Period** between flights (from system rules)
- Enforces **Max Weekly Duty Hours** cap per crew member
- Checks **crew availability records** for each flight date
- Matches **qualification type** to flight duration (long-haul/short-haul)
- Assigns **minimum crew per flight** as configured in system rules
- Detects and prevents **overlap conflicts** in both existing DB schedules and in-run batch assignments

### 🛫 Live Flight Board (FIDS)
Real-time airport-style Flight Information Display System:
- Flip-text animation on status changes
- Auto-refreshes every 30 seconds
- Filter by: All / On Time / Delayed / Cancelled
- Displays: Flight #, Route (IATA), Gate, Crew Count, Status

### 🔔 Notification System
In-app notifications for all roles:
- Types: `info`, `warning`, `success`, `critical`
- Click to mark as read, hover to delete
- Filter by type or unread status
- Live badge count in sidebar

### 📊 Analytics & Reports
- Crew utilization bar chart (top performers)
- Flight status pie chart (on-time / delayed / cancelled)
- Workload report CSV download
- Scheduling conflict report

### ⚙️ Configurable System Rules
Runtime-adjustable aviation compliance rules:
| Rule | Default |
|---|---|
| Max Daily Duty Hours | 12 hrs |
| Min Rest Period | 10 hrs |
| Max Weekly Duty Hours | 40 hrs |
| Min Crew Per Flight | 3 persons |
| Max Sectors Per Day | 4 |
| Long Haul Rest Bonus | 2 hrs |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS v4 |
| **UI Libraries** | Recharts, Framer Motion, Lucide Icons |
| **Fonts** | Inter (UI) + Space Mono (flight codes) |
| **Backend** | Node.js 22 + Express 5 |
| **Database** | PostgreSQL 16 + Prisma ORM 5 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Dev Tools** | Nodemon, Prisma Studio |

---

## 📁 Project Structure

```
SmartCrew/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB schema (User, Crew, Flight, Schedule, Rule, Notification...)
│   │   └── seed.js                # 16 users · 25 flights · 44 schedules · 23 notifications
│   └── src/
│       ├── algorithms/
│       │   └── scheduling.js      # AI scoring algorithm
│       ├── controllers/           # Route handlers (auth, crew, flight, schedule, notification...)
│       ├── middleware/
│       │   └── auth.js            # JWT auth + role guard middleware
│       ├── routes/                # Express routers
│       ├── services/
│       │   ├── schedulingService.js   # Auto-generate + conflict detection engine
│       │   └── reportingService.js    # Utilization & workload reports
│       └── index.js               # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.jsx          # Global radar-grid background wrapper
        │   └── Sidebar.jsx         # Live UTC clock · role badge · notif badge
        ├── context/
        │   ├── AuthContext.jsx     # JWT auth state
        │   └── RulesContext.jsx    # Live rules sync
        ├── pages/
        │   ├── LoginPage.jsx       # Aviation-themed login + demo quick-access panel
        │   ├── AdminDashboard.jsx  # Stats · charts · activity feed · rules
        │   ├── SchedulerDashboard.jsx  # Auto-generate · timeline table
        │   ├── CrewDashboard.jsx   # Boarding-pass flights · duty bar
        │   ├── FlightManagement.jsx    # Boarding-pass cards · status filter tabs
        │   ├── LiveFlightBoard.jsx     # FIDS airport departure board ✨ NEW
        │   ├── NotificationsPage.jsx   # Notification inbox ✨ NEW
        │   ├── CrewManagement.jsx
        │   ├── RulesManagement.jsx
        │   ├── ReportsPage.jsx
        │   ├── ConflictViewer.jsx
        │   └── AvailabilityManagement.jsx
        ├── services/
        │   └── api.js              # Axios instance (auto-attaches JWT)
        └── index.css               # Aviation theme: radar grid · boarding-pass · FIDS · HUD
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

### 1. Clone the repo
```bash
git clone https://github.com/RaKa8904/SmartCrew.git
cd SmartCrew
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crew_scheduling?schema=public"
JWT_SECRET="your_secure_jwt_secret_here"
PORT=5000
```

### 3. Run Database Migrations & Seed

```bash
# Apply all migrations
npx prisma migrate dev

# Seed with realistic demo data (16 users, 25 flights, 23 notifications...)
npx prisma db seed
```

### 4. Start the Backend

```bash
npm run dev
# Server starts on http://localhost:5000
```

### 5. Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 👤 Demo Accounts

> The login page includes a **Quick Access panel** — just click a role card to auto-fill credentials.

| Role | Email | Password |
|---|---|---|
| 🟡 **Admin** | `admin@airline.com` | `password123` |
| 🔵 **Scheduler** | `scheduler@airline.com` | `password123` |
| 🟣 **Pilot** | `pilot1@airline.com` → `pilot5@airline.com` | `password123` |
| 🟢 **Cabin Crew** | `cabin1@airline.com` → `cabin8@airline.com` | `password123` |

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Authenticated |

### Flights
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/flights` | All |
| POST | `/api/flights` | Admin, Scheduler |
| PUT | `/api/flights/:id` | Admin, Scheduler |
| PATCH | `/api/flights/:id` | Admin, Scheduler |
| DELETE | `/api/flights/:id` | Admin only |

### Crew
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/crew` | Admin, Scheduler |
| GET | `/api/crew/me` | Crew |
| POST | `/api/crew` | Admin |

### Scheduling
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/schedules/generate` | Admin, Scheduler |
| GET | `/api/schedules/conflicts` | Admin, Scheduler |

### Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/notifications` | Authenticated |
| GET | `/api/notifications/unread-count` | Authenticated |
| PATCH | `/api/notifications/:id/read` | Authenticated |
| PATCH | `/api/notifications/mark-all-read` | Authenticated |
| DELETE | `/api/notifications/:id` | Authenticated |

### Reports & Rules
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/reports/utilization` | Admin, Scheduler |
| GET | `/api/reports/workload/download` | Admin, Scheduler |
| GET | `/api/rules` | Authenticated |
| PUT | `/api/rules/:id` | Admin |

---

## 🗄️ Database Schema (ERD Summary)

```
User ─────── Crew ─────── Schedule ─────── Flight
              │                              
              ├─── Availability             
              │
              └─── (via User) Notification  

Rule    (system-wide scheduling rules)
Report  (generated analytics snapshots)
```

---

## 🐛 Known Limitations & Future Work

- [ ] Real-time WebSocket updates for live flight status
- [ ] Mobile-responsive layout
- [ ] Email notifications (SMTP integration)
- [ ] Flight status push from airline APIs (IATA / OAG)
- [ ] Multi-airline / multi-hub support
- [ ] Advanced ML model replacing heuristic scoring

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ for Final Year B.E. AI & Data Science**

<sub>SmartCrew · Aviation Operations Center · 2025–2026</sub>

</div>
