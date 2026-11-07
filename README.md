# Smart Personal Expense Tracker and Budget Management System

**A Full-Stack Financial Engineering Platform for Web Technologies Course Project**

---

## 1. Project Title
**Smart Personal Expense Tracker and Budget Management System**

## 2. Abstract
Managing personal finances, multiple income sources, and volatile daily expenditures is a fundamental challenge for individuals, college students, and working professionals. Traditional spreadsheet tracking lacks real-time validation, automatic categorization, and proactive overspending alerts. This project delivers an enterprise-grade, full-stack financial SaaS web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js/Express.js**, and **Supabase (PostgreSQL with Row Level Security)**. The system provides real-time income and expense tracking, category-wise monthly budget caps with dynamic visual alerts, interactive cash flow charts (via Recharts), and one-click CSV report exports.

---

## 3. Problem Statement
Individuals frequently suffer from "financial blindness" due to:
- Lack of centralized tracking for multi-channel earnings (salary, freelancing, investments).
- Inability to detect micro-spending leaks across discretionary categories (food delivery, entertainment, impulse shopping).
- Absence of real-time budget threshold warnings before funds are completely depleted.
- Privacy risks in naive web applications that store sensitive financial transactions in insecure browser storage or unencrypted flat files.

---

## 4. Project Objectives
1. **Financial Discipline**: Provide an intuitive interface to log transactions in under 5 seconds with precise categorization and payment method tags.
2. **Dynamic Budget Control**: Enforce category-level monthly budgets with green/orange/red progress indicators (Safe $\le 75\%$, Warning $75\%\text{--}100\%$, Exceeded $> 100\%$).
3. **Interactive Visual Analytics**: Deliver interactive charts illustrating monthly income vs. expense comparisons, category doughnut breakdowns, and savings trajectories.
4. **PostgreSQL Security & Isolation**: Implement PostgreSQL Row Level Security (RLS) policies where user data is isolated at the database kernel level.
5. **Localization**: Default to INR (₹) currency with authentic Indian numbering standards (`₹1,25,000.00`).

---

## 5. Technologies Used

| Tier | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | High-performance Single Page Application (SPA) with hot-module reload |
| **Routing** | React Router v7 | Client-side declarative routing and protected auth routes |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design following fintech SaaS aesthetics |
| **Charts & Visualization** | Recharts | Responsive SVG charts (BarChart, LineChart, PieChart) |
| **Iconography** | Lucide React | Consistent, lightweight vector icons |
| **Backend Framework** | Node.js + Express.js | Modular REST API with centralized validation and ownership checks |
| **Database & Auth** | Supabase (PostgreSQL) | PostgreSQL database, JWT authentication, and Row Level Security (RLS) |
| **Production Deployment** | Vercel & Render | Vercel for SPA frontend hosting; Render for Express backend service |

---

## 6. System Architecture

```
[ User Browser / Client ]
       │
       ▼ (HTTPS / REST)
[ Express.js REST API Server ]  <─── Bearer JWT Auth ───> [ Supabase Auth Engine ]
       │
       ▼ (PostgreSQL Wire Protocol / REST with RLS)
[ Supabase PostgreSQL Database ]
  ├── public.profiles     (RLS: auth.uid() = id)
  ├── public.transactions (RLS: auth.uid() = user_id)
  └── public.budgets      (RLS: auth.uid() = user_id)
```

1. **Client Tier**: React single-page app managing client-side routing, auth state, and Recharts rendering.
2. **Server Tier**: Express REST API verifying inbound Supabase JWT tokens via `Authorization: Bearer <token>`.
3. **Data Tier**: Supabase PostgreSQL executing Row Level Security policies, automated triggers, and constraint checks (preventing negative transaction amounts).

---

## 7. Main Features

- **Professional Landing Page**: Hero section, live dashboard teaser, feature pillars, and architecture overview.
- **Supabase Authentication**: Secure registration, email/password login, show/hide password, and password reset.
- **Instant Demo Evaluation Mode**: Review the platform out-of-the-box with pre-seeded transactions and budgets even before setting up cloud credentials.
- **Main Dashboard**:
  - 4 Summary Cards: Total Balance, Total Income, Total Expenses, Remaining Monthly Budget.
  - Date Filters: This Week, This Month, Last Month, This Year, and Custom Date Range.
  - Cash Flow Bar Chart: Past 6 months income vs. expense comparison.
  - Expense Category Doughnut Chart: Real-time percentage distribution.
  - Recent Transactions table with category icons and quick actions.
- **Income Management**: Add, edit, delete, search, and filter earnings by source (Salary, Freelancing, Business, Investments, Other) and date.
- **Expense Management**: Add, edit, delete with confirmation, search, filter by 10 distinct categories and payment methods, and sort by amount or date.
- **Budget Management**:
  - Monthly selector with backward/forward month navigation.
  - Overall monthly budget consumption meter.
  - Category-wise caps with color-coded alerts (Green, Orange, Red).
- **Reports & Analytics**:
  - Annual income vs. expense 12-month bar chart.
  - Net savings trend line chart.
  - Highest spending category rankings.
  - One-click CSV export with server-generated streaming attachment.
- **Profile & Settings**:
  - Update user full name and currency preference (INR ₹, USD $, EUR €, GBP £).
  - Password updates through Supabase.
  - Real-time Supabase connection modal.

---

## 8. Database Design (`supabase/schema.sql`)

### Tables

1. **`public.profiles`**
   - `id` (UUID, Primary Key, references `auth.users(id)` ON DELETE CASCADE)
   - `full_name` (TEXT)
   - `currency` (TEXT, default `'INR'`)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`public.transactions`**
   - `id` (UUID, Primary Key, default `gen_random_uuid()`)
   - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
   - `type` (TEXT, check `type IN ('income', 'expense')`)
   - `title` (TEXT)
   - `amount` (NUMERIC(12, 2), check `amount > 0`)
   - `category` (TEXT)
   - `payment_method` (TEXT)
   - `transaction_date` (DATE)
   - `description` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. **`public.budgets`**
   - `id` (UUID, Primary Key, default `gen_random_uuid()`)
   - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
   - `category` (TEXT)
   - `amount` (NUMERIC(12, 2), check `amount > 0`)
   - `month` (INTEGER, check `1 <= month <= 12`)
   - `year` (INTEGER, check `year >= 2000`)
   - `CONSTRAINT unique_user_category_month_year UNIQUE (user_id, category, month, year)`

### Row Level Security (RLS)
Every table has RLS enabled with policies verifying `auth.uid() = user_id`, guaranteeing zero cross-tenant access.

---

## 9. Project File Structure

```
smart-expense-tracker/
│
├── frontend/                     # Frontend client codebase
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI (Sidebar, Modals, Banner, Toasts)
│   │   ├── context/             # AuthContext (Supabase + Demo Mode)
│   │   ├── layouts/             # DashboardLayout with responsive drawer
│   │   ├── pages/               # Landing, Auth, Dashboard, Income, Expenses, Budgets, Reports, Settings
│   │   ├── services/            # Central API client & Supabase SDK factory
│   │   ├── utils/               # Indian numbering & date formatters
│   │   ├── App.tsx              # React Router v7 routes
│   │   ├── main.tsx             # DOM root mount
│   │   └── index.css            # Tailwind CSS v4 directives
│   ├── package.json
│   ├── .env.example
│   └── vercel.json              # Vercel SPA rewrite rules
│
├── backend/                      # Standalone Express backend for Render
│   ├── src/
│   │   └── server.js            # Standalone Express REST server
│   ├── package.json
│   └── .env.example
│
├── server/                       # Integrated full-stack dev server routes
│   ├── controllers/             # Transaction, Budget, Dashboard, Profile, Reports
│   ├── middleware/              # Auth token verifier
│   └── routes/                  # Express REST routes
│
├── supabase/
│   └── schema.sql               # PostgreSQL tables, RLS policies, trigger
│
├── server.ts                    # Root full-stack Express + Vite dev server
├── package.json                 # Root dependencies
├── README.md                    # Project documentation
└── .gitignore
```

---

## 10. Installation & Local Execution

### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm

### Step 1: Clone or Open Project
```bash
cd smart-expense-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Application
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

- **Web Application**: `http://localhost:3000`
- **REST API Health Check**: `http://localhost:3000/health`
- **REST API Endpoints**: `http://localhost:3000/api/*`

---

## 11. Environment Variable Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"

# Backend REST API Base URL
VITE_API_BASE_URL="/api"

# Backend Server Configuration
PORT=3000
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-publishable-key"
CLIENT_URL="http://localhost:3000"
```

*Note: If you run without `.env`, the app automatically enables the built-in Demo Evaluation Mode with full functionality.*

---

## 12. Supabase Cloud Configuration Guide

1. Navigate to [https://supabase.com](https://supabase.com) and click **Start your project** (Free Tier).
2. Choose a project name (e.g., `smart-expense-tracker`) and generate a secure database password.
3. Open the **SQL Editor** in the left sidebar.
4. Open `supabase/schema.sql` from this repository, copy the entire SQL script, paste it into the SQL Editor, and click **Run**.
5. Go to **Project Settings** -> **API** and copy:
   - **Project URL**
   - **Project API Keys** -> `anon` / `public`
6. Paste them into your `.env` or click the **Connect Supabase** button inside the app settings to test the live connection.

---

## 13. Deployment Instructions

### Frontend Deployment on Vercel
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and import the repository.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_API_BASE_URL`: Your deployed Render backend URL (e.g., `https://smart-expense-backend.onrender.com/api`)
5. Deploy. `vercel.json` automatically configures SPA routing fallbacks.

### Backend Deployment on Render
1. Create a **New Web Service** on [Render](https://render.com).
2. Connect your GitHub repository and specify Root Directory as `backend`.
3. Set:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
4. Add Environment Variables:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `CLIENT_URL`: Your Vercel frontend URL
5. Render verifies service health using the `GET /health` endpoint.

---

## 14. Testing & Quality Assurance Verification

| Test Case | Description | Result |
| :--- | :--- | :--- |
| **TC-01** | User registration with password confirmation & currency selection | Pass |
| **TC-02** | User login, session persistence, and logout | Pass |
| **TC-03** | Immediate evaluation via Demo Mode | Pass |
| **TC-04** | Route protection (unauthenticated redirects to `/login`) | Pass |
| **TC-05** | Adding positive income & expense records | Pass |
| **TC-06** | Validation check (rejects negative or zero amounts) | Pass |
| **TC-07** | Search and multi-category filtering | Pass |
| **TC-08** | Dynamic budget computation from actual transaction records | Pass |
| **TC-09** | Budget visual threshold indicators (green $\le 75\%$, orange $\le 100\%$, red $> 100\%$) | Pass |
| **TC-10** | Monthly cash flow and doughnut category analytics charts | Pass |
| **TC-11** | CSV transaction export generation with downloadable headers | Pass |
| **TC-12** | Mobile responsive navigation drawer and collapsible sidebar | Pass |

---

## 15. Future Enhancements
- **Recurring Subscriptions**: Automatic scheduling for monthly recurring expenses (Netflix, gym membership, utilities).
- **Receipt OCR Upload**: Mobile camera snapshot scanning to extract merchant, date, and amount via AI vision.
- **Multi-user Shared Budgets**: Household or roommate expense splitting with settlements.
- **Push & Email Overspending Alerts**: Automated notifications when a budget category hits 90%.

---

## 16. Author & Academic Information
- **Project Name**: Smart Personal Expense Tracker and Budget Management System
- **Course**: Web Technologies Laboratory Project
- **Architecture**: MERN / PERN (PostgreSQL, Express, React, Node.js)
