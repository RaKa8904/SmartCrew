<div align="center">

# ✈️ SmartCrew

### Aviation Operations Center — AI-Powered Crew Scheduling

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
  <img src="https://img.shields.io/badge/Project-Final%20Year%20T.E.%20AI%20%26%20DS-a78bfa?style=flat-square" />
</p>

> **An advanced, AI-powered full-stack aviation crew scheduling system** — automating crew assignment, conflict detection, duty compliance, and flight operations management for airlines. Built as a Final Year **T.E. AI & DS** Project.

</div>

---

## 📸 Preview

|     Interactive Scheduler      |            Admin Analytics            |         Live Flight Board          |
| :----------------------------: | :-----------------------------------: | :--------------------------------: |
| Drag-and-drop assignment board | Scatter plots, delays, and CSV export | FIDS airport-style departure board |

|     Flight Management     |              Crew Portal              |          Notifications           |
| :-----------------------: | :-----------------------------------: | :------------------------------: |
| Boarding-pass style cards | Shift Bids, Swaps, and Leave Requests | Real-time WebSocket + SMTP Email |

---

## ✨ Features

### 🛡️ Role-Based Access Control

Three distinct portals with protected routes and JWT authentication:

| Role          | Access                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| **Admin**     | Full control — crew, flights, rules, reports, analytics, system insights |
| **Scheduler** | Auto-generate schedules, drag-and-drop assignments, resolve conflicts    |
| **Crew**      | Personal schedule, shift bidding, peer swaps, availability management    |

### 🤖 AI Scheduling Engine & System Rules

Multi-factor crew scoring algorithm enforcing dynamic system rules:

- Respects **Min Rest Period** between flights
- Enforces **Max Weekly Duty Hours** cap per crew member
- Checks **Crew Availability** and **Leave Requests**
- Matches **Qualification Type** to flight constraints
- Detects and prevents **Overlap Conflicts** automatically.

### 🧠 Fatigue Risk Baseline

The project now has a first-pass fatigue risk target that predicts risk before assignment:

- Exposes a **0–100 fatigue risk score** plus **Low / Medium / High** class
- Uses rolling **24-hour / 7-day / 28-day duty windows** from current schedule history
- Factors in **hours since last rest**, **consecutive duty days**, **timezone crossings**, and **night/early-morning departures**
- Lives beside the rule engine as a baseline heuristic for the later synthetic-data and ML phases

### 🧩 Interactive Drag-and-Drop Scheduler

A specialized visual workspace for Schedulers:

- Filter available crew memebers by date.
- Drag-and-drop crew from the Available Pool directly onto upcoming Flight Cards.
- Triggers instant recalculation and assignment validation.

### 🌍 Real-World Flight Data Integration (Hybrid Engine)

The system is capable of ingesting live tracking data rather than relying completely on simulations:

- **Live FIDS Sync:** Instant integration with the **Aviationstack API** to ingest real-world, live domestic flights (e.g., DEL to BOM).
- **Fallback Simulation:** Automatically generates realistic high-volume routing models if an API key is absent.
- **Auto-Staffing Pipeline:** Wipes old dummy flights, pulls 60+ new tracking flights, and instantly fires the AI Scoring Engine to evaluate 80+ mock crew members and auto-staff every single real flight according to compliance rules.

### 📈 Advanced Analytics & Admin Dashboard

Actionable operational intelligence:

- **Fleet Delays (7-Day Forecast):** Rolling line chart tracking dispatch reliability.
- **Crew Fatigue Hotspots:** Scatter plot cross-referencing Scheduled Duty Hours vs Alert/Notification count to prevent burnout.
- **Crew Utilization:** Workload percentage ranking charts.
- **Data Export:** Instant raw CSV workload exports.

### 🛫 Live Flight Board (FIDS) & Real-Time Comms

Real-time operations synchronized across all active clients:

- **WebSockets:** Live updates to FIDS boards and Crew Portals via `Socket.io`.
- **SMTP Email Notifications:** Securely sends alert emails for manual scheduling changes directly to Crew member inboxes.
- Flip-text animation on status changes.

### 👥 Comprehensive Crew Self-Service Portal

Empowers crew members with direct schedule control:

- **Shift Swabbing:** Request shift trades with qualified peers. Includes multi-stage approval workflow.
- **Flight Bidding:** Place bids on unassigned priority flights.
- **Leave Management:** Submit and track leave request statuses.

---

## 🚀 Tech Stack

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **Frontend**       | React 19 + Vite 7 + Tailwind CSS v4               |
| **UI Interactive** | @dnd-kit/core (Drag & Drop), Recharts (Analytics) |
| **Fonts/Icons**    | Inter, Space Mono, Lucide React, Framer Motion    |
| **Backend**        | Node.js 22 + Express 5                            |
| **Real-Time**      | Socket.io (WebSockets), Nodemailer (SMTP)         |
| **Database**       | PostgreSQL 16 + Prisma ORM 5                      |
| **Auth**           | JWT (jsonwebtoken) + bcryptjs                     |

---

## 📁 Project Structure

```
SmartCrew/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB schemas (User, Crew, Flight, Schedule, Rule, Bids...)
│   │   └── seed.js                # Fully boots dummy data for 25+ flights & 15+ crew
│   └── src/
│       ├── algorithms/
│       │   └── scheduling.js      # Core scoring algorithm
│       ├── controllers/           # Business logic endpoints
│       ├── middleware/            # Auth and Roles
│       ├── routes/                # Express routing multiplexer
│       ├── services/
│       │   ├── emailService.js        # Nodemailer SMTP logic
│       │   ├── fatigueRiskService.js   # Heuristic fatigue preview baseline
│       │   ├── socketService.js       # Live event broadcaster
│       │   ├── reportingService.js    # Prisma Aggregation (Fatigue/Delays)
│       │   ├── schedulingService.js   # Constraints validation
│       │   └── flightSyncService.js   # Live Aviationstack Tracking Sync
│       └── index.js               # Node.js Server Boot
│
└── frontend/
    └── src/
        ├── components/
        │   └── Layout.jsx          # Radar HUD Wrapper
        ├── context/
        │   ├── AuthContext.jsx     # JWT Sync State
        │   └── RulesContext.jsx    # Live Dynamic Rules State
        ├── pages/
        │   ├── AdminDashboard.jsx  # Analytics & System Rules
        │   ├── SchedulerDashboard.jsx  # Drag-and-Drop Assignment
        │   ├── CrewDashboard.jsx   # Duty tracking & Shift Bidding
        │   ├── LiveFlightBoard.jsx # FIDS board
        │   └── ...                 # Swaps, Users, Conflicts
        └── index.css               # Futuristic aviation theme definitions
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+

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

# Optional: For Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: For Live Real-World Flight Data Sync
AVIATIONSTACK_API_KEY=your_api_key_here
```

### 3. Run Database Migrations & Seed

```bash
# Apply all generic migrations
npx prisma migrate dev

# Seed with rich mock flight data, schedules, and test accounts
npx prisma db seed
```

### 4. Start the Application

**Backend:**

```bash
npm run dev
# Server starts on http://localhost:5000
```

**Frontend:**

```bash
cd ../frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 👤 Demo Accounts

> The login page includes a **Quick Access panel** — just click a role card to auto-fill credentials.

| Role              | Email                   | Password      |
| ----------------- | ----------------------- | ------------- |
| 🟡 **Admin**      | `admin@airline.com`     | `password123` |
| 🔵 **Scheduler**  | `scheduler@airline.com` | `password123` |
| 🟣 **Pilot**      | `pilot1@airline.com`    | `password123` |
| 🟢 **Cabin Crew** | `cabin1@airline.com`    | `password123` |

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ for T.E. AI & DS**

<sub>SmartCrew · Aviation Operations Center · 2025–2026</sub>

</div>

---

## Fatigue Upgrade Roadmap

1. Phase 1 is now in place as a heuristic fatigue preview endpoint: `GET /api/reports/fatigue/preview?flightId=...`
2. Phase 2 will add synthetic training data and a labeled fatigue dataset.
3. Phase 3 is now complete: the trained artifact is saved at `backend/artifacts/fatigue/fatigue_model_v1.pkl`.
4. Current benchmark on the synthetic dataset: Random Forest, accuracy 95.40%, macro F1 78.23%, macro AUC 99.23%.
