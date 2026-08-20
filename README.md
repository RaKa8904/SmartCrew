# SmartCrew

### Aviation Operations and Automated Crew Scheduling Platform

SmartCrew is an enterprise-grade crew scheduling and flight operations management platform. It automates crew assignment, enforces flight duty compliance rules, evaluates pilot and cabin crew fatigue using machine learning, and synchronizes live dispatch operations across flight control centers.

---

## Operations Overview

SmartCrew streamlines airline flight operations through three core portals:

| Portal | User Role | Functionality |
| :--- | :--- | :--- |
| **Admin Operations** | System Administrators | User management, global compliance rule configuration, fleet analytics, fatigue reporting |
| **Dispatch & Scheduling** | Flight Schedulers | Interactive roster workspace, automated crew scoring, drag-and-drop dispatch, overlap resolution |
| **Crew Self-Service** | Pilots & Cabin Crew | Personal roster view, shift bidding, peer shift swaps, leave requests |

---

## Core Capabilities

### Machine Learning Fatigue Risk Engine
Integrated predictive fatigue risk management engine evaluating crew burnout parameters before duty assignment:
- **Biomathematical Risk Scoring**: Computes a continuous fatigue score (0–100) and risk classification (Low, Medium, High).
- **Multi-Window Duty Tracking**: Evaluates rolling duty metrics over 24-hour, 7-day, and 28-day historical windows.
- **Circadian & Shift Disruption**: Incorporates rest intervals since last duty, consecutive duty days, time-zone shifts, and early morning or night departures.
- **Random Forest Inference Model**: Uses a scikit-learn Random Forest classifier (`fatigue_model_v1.pkl`) invoked via a Python subprocess IPC pipeline in `fatigueRiskService.js`, with an automated heuristic baseline fallback.
- **Preview API Integration**: Exposes real-time pre-assignment risk predictions (`GET /api/reports/fatigue/preview`).

### Dynamic Rules & Automated Constraint Engine
Scoring algorithm evaluating crew eligibility against regulatory limits:
- Mandatory minimum rest period verification between duties.
- Rolling weekly and monthly duty hour limits.
- Qualification matching (aircraft type, rank, certification).
- Automatic overlap detection and conflict prevention.

### Interactive Drag-and-Drop Scheduler
Specialized visual workspace for flight operations schedulers:
- Dynamic crew filtering by availability, qualification, and date window.
- Visual assignment onto flight rosters using `@dnd-kit`.
- Instant server-side constraint re-validation upon assignment.

### Hybrid Flight Data Integration
Flexible flight ingestion pipeline:
- **Live Aviationstack API Sync**: Synchronizes actual flight numbers, routes, and departure times.
- **Fallback Simulation Engine**: Generates high-density flight schedules when external API connectivity is inactive.
- **Automated Roster Pipeline**: Staffs incoming flights according to compliance rules and crew availability.

### Real-Time Communications & FIDS
Operations synchronization across active web sessions:
- **Flight Information Display System (FIDS)**: Live departure/arrival board updated via `Socket.io` WebSockets.
- **Automated Dispatch Alerts**: Email notifications sent via Nodemailer SMTP upon roster updates or shift assignments.

### Crew Self-Service & Rostering
Direct schedule management for crew members:
- **Peer Shift Swaps**: Peer-to-peer shift exchange with multi-tier approval control.
- **Flight Bidding**: Crew preference bidding on unassigned flight legs.
- **Leave Request Management**: Submission and tracking of time-off requests.

### Operational Analytics
Actionable intelligence for flight operations management:
- **Fleet Reliability Metrics**: 7-day delay trends and dispatch performance indicators.
- **Fatigue Distribution Analysis**: Duty hours vs. operational alert correlation scatter plots.
- **Workload Export**: Raw CSV export capability for crew utilization reports.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, Vite 7, Tailwind CSS v4 |
| **Visual Components** | `@dnd-kit/core`, Recharts, Framer Motion, Lucide Icons |
| **Backend API** | Node.js 22, Express 5 |
| **Real-Time Layer** | Socket.io (WebSockets), Nodemailer (SMTP) |
| **Data & ORM** | PostgreSQL 16, Prisma ORM 5 |
| **Machine Learning** | Python 3, scikit-learn (Random Forest), NumPy, Pandas |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |

---

## Project Structure

```
SmartCrew/
├── backend/
│   ├── artifacts/
│   │   └── fatigue/
│   │       └── fatigue_model_v1.pkl     # Trained Random Forest model artifact
│   ├── prisma/
│   │   ├── schema.prisma                # Database schemas (Users, Crew, Flights, Schedules, Rules)
│   │   └── seed.js                      # Database seeder script
│   ├── scripts/
│   │   ├── generate-fatigue-dataset.js  # Synthetic training data generator
│   │   ├── train-fatigue-model.py       # ML training pipeline script
│   │   └── predict-fatigue.py           # Subprocess model inference bridge
│   └── src/
│       ├── algorithms/
│       │   └── scheduling.js            # Core crew eligibility scoring algorithm
│       ├── controllers/                 # Express API controllers
│       ├── middleware/                  # JWT authentication and RBAC middleware
│       ├── routes/                      # API route definitions
│       ├── services/
│       │   ├── emailService.js          # SMTP notification service
│       │   ├── fatigueRiskService.js     # ML model integration and heuristic fallback
│       │   ├── flightSyncService.js     # Aviationstack API integration
│       │   ├── reportingService.js      # Analytics aggregations
│       │   ├── schedulingService.js     # Duty constraint checking
│       │   └── socketService.js         # WebSocket broadcast management
│       └── index.js                     # Application entry point
│
└── frontend/
    └── src/
        ├── components/                  # Layout and reusable UI components
        ├── context/                     # Auth and global application state
        ├── pages/
        │   ├── AdminDashboard.jsx       # Analytics and system rules management
        │   ├── SchedulerDashboard.jsx   # Interactive drag-and-drop workspace
        │   ├── CrewDashboard.jsx        # Crew schedule, swaps, and bidding
        │   └── LiveFlightBoard.jsx      # Real-time FIDS display
        └── index.css                    # Global application styles
```

---

## Setup and Installation

### Prerequisites

- **Node.js** v18.0.0 or higher
- **PostgreSQL** v14.0 or higher
- **Python** 3.9 or higher (for ML fatigue model inference)

### 1. Repository Setup

```bash
git clone https://github.com/RaKa8904/SmartCrew.git
cd SmartCrew
```

### 2. Backend Configuration

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crew_scheduling?schema=public"
JWT_SECRET="your_secure_jwt_secret_key"
PORT=5000

# Optional: Email Notification Settings
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: Live Flight Sync Settings
AVIATIONSTACK_API_KEY=your_api_key_here
```

### 3. Database Migration and Seeding

```bash
# Run database migrations
npx prisma migrate dev

# Seed initial flight, crew, and operational data
npx prisma db seed
```

### 4. Machine Learning Model Training (Optional)

The pre-trained model artifact is included in `backend/artifacts/fatigue/fatigue_model_v1.pkl`. To re-generate synthetic datasets and re-train the model:

```bash
# Generate synthetic training dataset
node scripts/generate-fatigue-dataset.js

# Train the Random Forest model
python scripts/train-fatigue-model.py
```

### 5. Running the Application

**Backend Server:**

```bash
npm run dev
# Server accessible at http://localhost:5000
```

**Frontend Client:**

```bash
cd ../frontend
npm install
npm run dev
# Interface accessible at http://localhost:5173
```

---

## Demo Accounts

The login interface provides quick-access credentials for operational testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@airline.com` | `password123` |
| **Flight Scheduler** | `scheduler@airline.com` | `password123` |
| **Pilot** | `pilot1@airline.com` | `password123` |
| **Cabin Crew** | `cabin1@airline.com` | `password123` |

---

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for full licensing information.
