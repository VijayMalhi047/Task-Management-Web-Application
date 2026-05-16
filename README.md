# TaskFlow — Full-Stack Task Management Web Application

A high-performance, secure, and production-ready full-stack Task Management application built using a decoupled client-server architecture. The project is designed as a monolithic monorepo featuring robust multi-tenant token isolation, reactive filter pipelines, and an embedded WebAssembly data persistence layer optimized for stateless environments.

---

## 🚀 Value Propositions

* **Zero-Configuration Relational Data Layer:** Built utilizing WebAssembly (`sql.js`) to provide raw, high-performance SQLite engine functionality entirely in runtime memory, eliminating the need for bulky native server dependencies (`node-gyp`, Python, or C++ compilation kits).
* **Stateless Resilience:** Architected with dynamic environmental routing that intercepts cloud storage locks and hardware-level write blocks, switching instantly to transient partitions (`/tmp`) when deployed to serverless topologies.
* **Granular Multi-Tenant Security:** Enforces explicit cryptographic boundaries using JSON Web Tokens (JWT) and deterministic password hashing primitives to guarantee absolute data isolation between multi-tenant user scopes.
* **Fail-Safe Asynchronous Workflows:** Outbound transaction channels (like automated email delivery systems) are wrapped inside custom fault-tolerant interceptors, guaranteeing core client operations never encounter service degradation or upstream gateway crashes.
<img width="1897" height="877" alt="image" src="https://github.com/user-attachments/assets/283b9502-12b1-4ed6-b331-0df1de1141e3" />

---

## ✨ Core Features

### 🔒 Authentication & Access Control
* **Secure Registration:** Registers user accounts securely using high-iteration `bcryptjs` salt rounds for password safety.
* **Multi-Factor Verification:** Generates time-sensitive 6-digit OTP tokens stored natively with system-epoch expiration constraints.
* **Stateful Sessions:** Implements standard stateless bearer security using digitally signed JWT access profiles.
<img width="1854" height="855" alt="image" src="https://github.com/user-attachments/assets/f4dd82e3-d9f9-4b35-a50a-8a0702ccf473" />
<img width="1787" height="867" alt="image" src="https://github.com/user-attachments/assets/2fac28c9-d296-4725-a79a-9d3110e8b3a6" />
<img width="1811" height="840" alt="image" src="https://github.com/user-attachments/assets/222f575e-8e00-4ff5-8cda-a562f9a1e6d1" />



### 📋 Task Management Pipeline
* **Full CRUD Operations:** Seamlessly create, read, update, and delete tasks dynamically scoped to the logged-in user.
* **Dynamic Sorting & Filtering:** Real-time search query matching across multi-dimensional criteria (Priority levels: Low/Medium/High; Status: Pending/Completed).
* **Instant UI Synthesis:** Synchronous UI changes powered by modular React client state management workflows.
<img width="1736" height="859" alt="image" src="https://github.com/user-attachments/assets/39ebe389-0299-4f1d-96e4-a808bf1b93cc" />

---

## 🛠️ Technology Stack

| Layer | Technology | Key Utility |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18) | Single Page Application framework layer |
| | Vite | Next-generation frontend bundler and asset compiler |
| | Tailwind CSS | Utility-first responsive design mapping system |
| **Backend** | Node.js / Express | Robust asynchronous REST API routing monolith |
| | Serverless HTTP | Serverless framework interface adapter |
| **Database** | SQLite via `sql.js` (WASM) | Pure WebAssembly compiled relational database engine |
| **Security** | JWT & BcryptJS | Payload signing and cryptographic pass hashing |
| **Deployment** | Netlify | Monorepo client-hosting and automated cloud functions |

---

## 📁 Project Structure

```text
Task-Management-Web-Application/
├── frontend/               # React Client Layer (Vite + Tailwind)
│   ├── src/
│   │   ├── api/            # Axial API state connection layers (auth, tasks)
│   │   ├── components/     # Reusable atomic UI controls (TaskCard, FilterBar)
│   │   ├── pages/          # Primary core viewport layouts (AuthPage)
│   │   ├── App.jsx         # App view controller
│   │   └── main.jsx        # Document Object Model entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                # Express REST Layer (Serverless Ready)
│   ├── config/             # Database initialization and storage abstractions
│   ├── controllers/        # Core business operations logic (auth, tasks)
│   ├── middleware/         # Token validation and global error sanitizers
│   ├── routes/             # Unified HTTP route endpoint definitions
│   ├── db/                 # Local disk database state space (ignored in Git)
│   ├── server.js           # Server controller and entry layer
│   └── package.json
├── netlify.toml            # Cloud deployment configuration
└── .gitignore              # Environment safeguard maps
```

---

## 🔌 API Documentation

### 🔐 Authentication Routes (`/api/auth`)

#### 1. User Registration
* **Endpoint:** `POST /signup`
* **Payload:**
  ```json
  {
    "username": "Vijay",
    "email": "vijay@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "message": "OTP sent to your email. Please verify to complete signup.",
    "email": "vijay@example.com"
  }
  ```

#### 2. OTP Code Verification
* **Endpoint:** `POST /verify-otp`
* **Payload:**
  ```json
  {
    "email": "vijay@example.com",
    "otp": "123456"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "message": "Email verified successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "username": "Vijay", "email": "vijay@example.com" }
  }
  ```

#### 3. User Login
* **Endpoint:** `POST /login`
* **Payload:**
  ```json
  {
    "email": "vijay@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 📋 Task Management Routes (`/api/tasks`)
*All task operations require an `Authorization: Bearer <token>` access credential header.*

#### 1. Fetch Tenant Tasks
* **Endpoint:** `GET /`
* **Success Response (200 OK):**
  ```json
  [
    {
      "id": 12,
      "title": "Optimize Cloud Storage",
      "description": "Configure ephemeral write fallback buffers",
      "priority": "High",
      "status": "pending",
      "created_at": "2026-05-17 03:00:00",
      "user_id": 1
    }
  ]
  ```

#### 2. Create Task
* **Endpoint:** `POST /`
* **Payload:**
  ```json
  {
    "title": "Refactor Database Mapping",
    "description": "Migrate system architecture schema models",
    "priority": "Medium"
  }
  ```

#### 3. Update Task
* **Endpoint:** `PUT /:id`
* **Payload:**
  ```json
  {
    "title": "Refactor Database Mapping",
    "description": "Completed migration mappings",
    "priority": "Medium",
    "status": "completed"
  }
  ```

#### 4. Delete Task
* **Endpoint:** `DELETE /:id`
* **Success Response (200 OK):**
  ```json
  { "message": "Task deleted successfully." }
  ```

---

## 💻 Local Installation Guide

### Prerequisites
* Node.js (v18 or higher recommended)
* NPM

### Step-by-Step Configuration

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/VijayMalhi047/Task-Management-Web-Application.git
   cd Task-Management-Web-Application
   ```

2. **Configure Environment Secrets:**
   Navigate into the `backend/` folder and create a real `.env` file from the provided template:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Open the `.env` file and append your secure secret details:
   ```env
   PORT=5000
   JWT_SECRET=generate_your_cryptographic_secret_string_here
   EMAIL_USER=your_verified_gmail_address@gmail.com
   EMAIL_PASS=your_16_digit_google_app_password
   ```

3. **Launch the Serverless API Layer:**
   From the `backend/` directory, execute dependency provisioning and spin up the developer server node:
   ```bash
   npm install
   npm run dev
   ```
   The database engine will automatically mount, configure the runtime schema layouts, and begin listening for client connections on `http://localhost:5000`.

4. **Launch the User Interface Canvas:**
   Open a separate shell terminal partition, navigate to the `frontend/` directory, install assets, and ignite the Vite bundler:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open your browser target page at `http://localhost:5173` to test the full operational stack.

---

## ☁️ Cloud Deployment Considerations (Serverless Monorepo)

This codebase has been engineered to run as a unified application inside **Netlify’s Serverless Cloud Infrastructure**. To deploy this effectively while keeping its local configurations clean, the following infrastructure rules are active:

### 1. Ephemeral Disk Persistence Isolation
Serverless runtime engines enforce a strict read-only architecture context. To resolve this, `backend/config/database.js` runs a structural environment test:
```javascript
const isServerless = process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT;
const DB_DIR  = isServerless ? "/tmp" : path.join(__dirname, "../db");
```
When running on the cloud, relational updates write straight to the allowed transient memory partition (`/tmp`). 

> 📌 *Note on Serverless Architecture: Netlify cloud functions scale down to a sleeping state after inactivity, resetting the temporary file structure. For a scaling multi-tenant production environment, the `sql.js` driver layer can be swapped instantly for an external hosted relational endpoint like Supabase or Neon PostgreSQL.*

### 2. Cloud Outbound Mail Bypass Handling
Most enterprise cloud computing endpoints restrict background transactional SMTP routing. To ensure flawless end-to-end user verification cycles, a custom fallback engine interceptor has been coded into the registration sequence. 

If a network-level socket lock prevents email delivery, the app securely diverts traffic to prevent a 502 Bad Gateway response. It prints the active 6-digit access OTP token directly to the **Netlify Functions Dashboard Console Log**, allowing for simple, seamless, and unblocked review workflows.
