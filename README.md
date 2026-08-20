# SmartCrew

### Aviation Operations and Automated Crew Scheduling Platform

SmartCrew is an enterprise-grade crew scheduling and flight operations management platform. It automates crew assignment, enforces flight duty compliance rules, evaluates pilot and cabin crew fatigue using machine learning, and synchronizes live dispatch operations across flight control centers.

---

## Operations Overview

SmartCrew streamlines airline flight operations through three core portals:

| Portal | User Role | Functionality |
| :--- | :--- | :--- |
| **Admin Operations** | System Administrators | User management, global compliance rule configuration, fleet analytics, fatigue governance |
| **Dispatch & Scheduling** | Flight Schedulers | Interactive roster workspace, AI recommendation engine, drag-and-drop dispatch, overlap resolution |
| **Crew Self-Service** | Pilots & Cabin Crew | Personal roster view, circadian recovery timeline, shift bidding, peer shift swaps, leave requests |

---

## Core Capabilities

### Machine Learning Fatigue Risk Engine & Explainable AI (XAI)
Integrated predictive fatigue risk management engine evaluating crew burnout parameters before duty assignment:
- **Biomathematical Risk Scoring**: Computes a continuous fatigue score (0–100) and risk classification (Low, Medium, High).
- **Explainable AI (XAI) Risk Drivers**: Highlights exact contributing risk factors per recommendation (for example, High 24h Duty, Short Rest Window, Window of Circadian Low shift, Timezone crossings).
- **Random Forest Inference Model**: Uses a scikit-learn Random Forest classifier (`fatigue_model_v1.pkl`) trained on active database duty samples and invoked via Python subprocess IPC.
- **24-Hour Automated Background Retraining**: Automated daily background schedule (`startAutoRetrainScheduler`) that ingests live PostgreSQL database records and retrains model weights hands-free.

### AI Smart Recommendation Drawer & Auto-Assignment
Specialized recommendation engine for flight schedulers:
- **Candidate Ranking**: Evaluates all active crew members against flight requirements, ranking candidates by match score.
- **Qualification Match Filtering**: Ensures type rating and qualification alignment (e.g. B777 / A320 Captain requirements).
- **1-Click Auto-Assignment**: Assigns top recommended crew directly onto flight legs with automatic drawer close and instant FIDS synchronization.

### Circadian Rhythm & Sleep Recovery Timeline
Interactive circadian recovery tracking widget:
- **Sleep Window Visualization**: Displays required rest intervals, sleep windows, and circadian buffer hours before duty departure.
- **Window of Circadian Low (WOCL)**: Alerts schedulers and crew when duty legs overlap circadian night windows (22:00–06:00).

### Dynamic Rules & Automated Constraint Engine
Scoring algorithm evaluating crew eligibility against regulatory limits:
- Mandatory minimum rest period verification between duties.
- Rolling weekly and monthly duty hour limits.
- Qualification matching (aircraft type, rank, certification).
- Automatic overlap detection and conflict prevention.

### Interactive Drag-and-Drop Scheduler
Visual workspace for flight operations schedulers:
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
│   │       ├── fatigue_model_v1.pkl             # Trained Random Forest model artifact
│   │       └── fatigue_model_v1_manifest.json   # Model metadata and training manifest
│   ├── prisma/
│   │   ├── schema.prisma                        # Database schemas (Users, Crew, Flights, Schedules, Rules)
│   │   └── seed.js                              # Database seeder script
│   ├── scripts/
│   │   ├── generate-fatigue-dataset.js          # Live database training data generator
│   │   ├── train-fatigue-model.py               # ML training pipeline script
│   │   └── predict-fatigue.py                   # Subprocess model inference bridge with XAI
│   └── src/
│       ├── algorithms/
│       │   └── scheduling.js                    # Core crew eligibility scoring algorithm
│       ├── controllers/                         # Express API controllers
│       ├── middleware/                          # JWT authentication and RBAC middleware
│       ├── routes/                              # API route definitions
│       ├── services/
│       │   ├── fatigueRiskService.js             # ML model batch integration & smart recommendations
│       │   ├── flightSyncService.js             # Aviationstack API integration
│       │   ├── reportingService.js              # Analytics aggregations
│       │   ├── schedulingService.js             # Duty constraint checking
│       │   └── socketService.js                 # WebSocket broadcast management
│       └── index.js                             # Application entry point with 24h retrain scheduler
│
└── frontend/
    └── src/
        ├── components/                          # Layout and reusable UI components
        ├── context/                             # Auth and global application state
        ├── pages/
        │   ├── AdminDashboard.jsx               # Analytics and system rules management
        │   ├── SchedulerDashboard.jsx           # Interactive drag-and-drop & AI recommendation workspace
        │   ├── CrewDashboard.jsx                # Crew schedule, circadian recovery, swaps, and bidding
        │   └── LiveFlightBoard.jsx              # Real-time FIDS display
        └── index.css                            # Global application styles
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

The pre-trained model artifact is included in `backend/artifacts/fatigue/fatigue_model_v1.pkl`. To re-generate datasets from active database records and re-train the model:

```bash
# Generate training dataset from live DB records
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
