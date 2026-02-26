# 🏢 LeaveFlow — Employee Leave Management System

A production-ready, full-stack HR SaaS application for managing employee leave requests with role-based access control.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Chart.js |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcrypt, Context API |
| UI | Lucide React icons, react-hot-toast |

---

## 🔐 Role-Based Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@company.com | Admin@123 |
| **Manager** | manager@company.com | Manager@123 |
| **Employee** | alice@company.com | Employee@123 |
| **Employee** | bob@company.com | Employee@123 |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create/edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee_leave_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Get current user |
| PUT | `/profile` | Private | Update profile/password |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin/Manager | List all users |
| POST | `/` | Admin | Create user |
| GET | `/:id` | Admin/Manager | Get user by ID |
| PUT | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |
| PUT | `/:id/toggle-active` | Admin | Activate/deactivate |

### Leaves (`/api/leaves`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | All | Apply for leave |
| GET | `/my` | All | Get own leaves |
| GET | `/stats/my` | All | Own leave stats |
| GET | `/` | Manager/Admin | Get all leaves |
| GET | `/stats/system` | Manager/Admin | System stats |
| PUT | `/:id/status` | Manager/Admin | Approve/reject |
| PUT | `/:id/cancel` | Employee | Cancel pending leave |
| PUT | `/bulk-status` | Manager/Admin | Bulk approve/reject |

### Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/logs` | Admin | Audit logs |
| GET | `/stats` | Admin | User stats |

### Departments (`/api/departments`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | All | List departments |
| POST | `/` | Admin | Create department |
| PUT | `/:id` | Admin | Update department |
| DELETE | `/:id` | Admin | Delete department |

---

## 📂 Project Structure

```
Employee Management System/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── leaveController.js
│   │   └── departmentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Leave.js
│   │   ├── Department.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── departmentRoutes.js
│   │   └── adminRoutes.js
│   ├── scripts/seed.js
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── components/
        │   ├── layout/ (Sidebar, Navbar, DashboardLayout)
        │   ├── ui/ (Modal, StatusBadge, Pagination, SkeletonLoader, Spinner, SearchFilter)
        │   └── charts/ (Charts.jsx)
        └── pages/
            ├── auth/ (Login, Register)
            ├── employee/ (Dashboard, ApplyLeave, Profile)
            ├── manager/ (Dashboard)
            └── admin/ (Dashboard, UserManagement, AuditLogs, Departments)
```

---

## ✨ Features

- 🔐 JWT authentication with role-based access (Admin / Manager / Employee)
- 🌙 Dark / Light mode toggle
- 📊 Chart.js analytics (bar + doughnut)
- 📋 Paginated, searchable tables everywhere
- ✅ Bulk approve/reject for managers
- 📝 Audit logs for all admin/manager actions
- 🔔 Toast notifications for all operations
- 📱 Fully responsive mobile layout
- 🗂️ Department management with manager assignment
- ⚡ Leave balance auto-calculation on approval
