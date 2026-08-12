# Technologies Used in RiseUp Financial Manager

This document provides a detailed overview of all the technologies, frameworks, libraries, and core architectural engines used in the **RiseUp Financial Manager** platform, specifying **where** each technology is implemented and **why** it was selected.

---

## 📑 Table of Contents
1. [Frontend Stack (Client-Side)](#1-frontend-stack-client-side)
2. [Backend Stack (Server-Side)](#2-backend-stack-server-side)
3. [Database & Security](#3-database--security)
4. [Core Architectural & Domain Engines](#4-core-architectural--domain-engines)
5. [Resiliency & Developer Utilities](#5-resiliency--developer-utilities)

---

## 🎨 1. Frontend Stack (Client-Side)

### **React.js (v18)**
- **Where Used**: `client/src/App.jsx`, `client/src/pages/*`, `client/src/components/*`
- **Why Used**:
  - Acts as the core framework for building a reactive Single Page Application (SPA).
  - Enables component-based state management (`useState`, `useEffect`) for instant recalculation of 5-bucket sliders, milestone checklists, and dynamic workspace tab changes without full page reloads.

### **Vite**
- **Where Used**: `client/vite.config.js`, local development server (`http://localhost:3000`)
- **Why Used**:
  - Replaces traditional bundlers with native ESM loading for sub-second Hot Module Replacement (HMR) and fast build speeds.
  - Manages environment variables (`VITE_API_URL`) and provisions local development proxies to route `/api/*` traffic seamlessly to the Node Express server.

### **Lucide React**
- **Where Used**: All dashboard views (`Sidebar.jsx`, `Navbar.jsx`, `Dashboard.jsx`, `FinanceEngine.jsx`, `GoalRoadmap.jsx`, `AnalyticsForecasting.jsx`, `BlockchainLedger.jsx`, `PersonalizationProfile.jsx`)
- **Why Used**:
  - Provides lightweight, high-quality SVG vector icons tailored for financial platforms (wallets, pie charts, blockchain locks, health pulse indicators, and status badges).

### **Vanilla CSS & Custom Design System (Light Glassmorphism)**
- **Where Used**: `client/src/index.css`
- **Why Used**:
  - Provides full styling control without the overhead of heavy CSS frameworks.
  - Implements a light glassmorphism aesthetic using CSS custom properties (`--bg-light`, `--bg-card`, `--text-primary`, `--accent-cyan`, `--accent-emerald`), crisp shadows, subtle glass backdrop filters, and custom smooth range sliders.

---

## 🚀 2. Backend Stack (Server-Side)

### **Node.js**
- **Where Used**: Backend runtime environment (`server/src/server.js`)
- **Why Used**:
  - Delivers an asynchronous, event-driven JavaScript engine ideal for handling concurrent REST API requests from multi-tenant client sessions with high throughput.

### **Express.js**
- **Where Used**: `server/src/server.js`, `server/src/routes/*`
- **Why Used**:
  - Provides a lightweight, flexible web framework to structure RESTful endpoints:
    - `/api/auth` — User login, registration, and token validation.
    - `/api/finance` — Incomes, expenses, and 5-bucket budget allocations.
    - `/api/goals` — Target monthly income goals and milestone roadmaps.
    - `/api/analytics` — Spend breakdown categories and 12-month projections.
    - `/api/blockchain` — On-chain cryptographic proof verifications.
    - `/api/tenants` — Multi-tenant organization creation and switching.
    - `/api/notifications` — Daily goal check-ins and motivation engine alerts.

### **Dotenv**
- **Where Used**: `server/src/server.js`, `server/.env`
- **Why Used**:
  - Loads environment configuration variables (`MONGODB_URI`, `JWT_SECRET`, `PORT`) safely into Node's `process.env`, separating secrets from version-controlled codebase files.

---

## 🔒 3. Database & Security

### **Mongoose & MongoDB Atlas**
- **Where Used**: `server/src/config/db.js`, `server/src/models/*` (`Income.js`, `Expense.js`, `Budget.js`, `Goal.js`, `Roadmap.js`, `BlockchainRecord.js`, `Tenant.js`, `User.js`)
- **Why Used**:
  - MongoDB Atlas provides a managed cloud NoSQL database that accommodates schema evolution for financial data.
  - Mongoose supplies object data modeling (ODM) with schema validation, document relationship references, and fast querying filtered by `tenantId`.

### **JSON Web Tokens (JWT)**
- **Where Used**: `server/src/middleware/auth.js`, `server/src/controllers/authController.js`
- **Why Used**:
  - Enables stateless, secure authentication across HTTP requests.
  - Embeds user identity and tenant permissions inside bearer tokens verified by `process.env.JWT_SECRET`.

### **bcryptjs**
- **Where Used**: `server/src/controllers/authController.js`, `server/src/models/User.js`
- **Why Used**:
  - Performs salted cryptographic hashing of user passwords before persistence in MongoDB, preventing plain-text credential leaks.

---

## 💡 4. Core Architectural & Domain Engines

### **Multi-Tenant Workspace Isolation Architecture**
- **Where Used**: Middleware & Controllers (`req.headers['x-tenant-id']`)
- **Why Used**:
  - Allows single-instance deployment to host isolated workspaces (Personal vs Household vs Business).
  - Ensures every database operation automatically filters records by the active `tenantId`.

### **Personalization & Health Policy Engine**
- **Where Used**: `server/src/controllers/financeController.js`, `PersonalizationProfile.jsx`
- **Why Used**:
  - Evaluates user age bands and medical risk flags (e.g. `chronic_condition_high_cost`) to dynamically carve out healthcare safety buffers (e.g. 15% health buffer) in budget allocations.

### **SHA-256 Cryptographic Blockchain Ledger**
- **Where Used**: `server/src/controllers/blockchainController.js`, `server/src/services/blockchainService.js`, `BlockchainLedger.jsx`
- **Why Used**:
  - Generates immutable SHA-256 hashes and block numbers whenever career milestones are completed, creating a tamper-evident audit trail that users can independently verify.

### **Explainable ML Predictive Income Trajectory Engine**
- **Where Used**: `server/src/controllers/analyticsController.js`, `AnalyticsForecasting.jsx`
- **Why Used**:
  - Projects 12-month income trajectories based on skill acquisition pace, net savings velocity, and market job salary data with explainable model confidence scores.

---

## ⚡ 5. Resiliency & Developer Utilities

### **Auto-Incrementing Dynamic Port Bounding**
- **Where Used**: `server/src/server.js`
- **Why Used**:
  - Probes available ports (`5000 -> 5001 -> 5002 -> 5003`) on server boot to prevent local `EADDRINUSE` port collision crashes during local development.

### **Multi-Port Client Discovery Fetch Engine**
- **Where Used**: `client/src/App.jsx` (`apiFetch` utility)
- **Why Used**:
  - Enables the React frontend to scan active backend ports dynamically if the server increments its port, avoiding hardcoded endpoint connectivity failures.

### **Mock Store Fallback System**
- **Where Used**: `server/src/store/mockDataStore.js`, all server controllers
- **Why Used**:
  - Provides uninterrupted application functionality during cloud database connection transitions or network DNS buffering.

---

*Generated for RiseUp Financial Manager Repository.*
