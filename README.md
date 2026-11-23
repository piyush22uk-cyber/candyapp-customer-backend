<div align="center">

# ⚙️ CandyApp Backend

### Secure REST API powering the CandyApp customer & admin apps

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

[✨ Features](#-features) • [🛠 Tech Stack](#-tech-stack) • [🔌 API](#-api-overview) • [🚀 Getting Started](#-getting-started) • [🔗 Ecosystem](#-candyapp-ecosystem)

</div>

---

## 📖 About

This is the backend of the **CandyApp** platform, built with Node.js, Express and MongoDB. It serves the customer app ([CandyApp](https://github.com/piyush22uk-cyber/CandyApp)) and the admin app ([CandyAdminJS](https://github.com/piyush22uk-cyber/CandyAdminJS)).

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Authentication** | Email/password and Google sign-in (Firebase Admin) |
| 🎟️ | **JWT Sessions** | Access tokens with a refresh-token flow |
| 🛡️ | **Role-based Access** | `customer`, `admin` and `superadmin` roles |
| 🔑 | **Screen Permissions** | Per-screen access control for admins |
| 🍭 | **Products** | List, search, create, update, delete, with image upload |
| 🛒 | **Cart** | Per-user cart with quantity management |
| 📦 | **Orders** | Stock reservation and status tracking |
| 📍 | **Addresses** | Save, update and delete delivery addresses |
| 🔔 | **Push Notifications** | Expo push for customers and admins, with history |
| 👑 | **Super Admin Tools** | Create admins, manage permissions |

**Order statuses:** `Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` (or `Cancelled`)

## 🛠 Tech Stack

| Category | Technologies |
|---|---|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express 5 |
| **Database** | MongoDB, Mongoose |
| **Auth** | JSON Web Tokens, bcryptjs, Firebase Admin SDK |
| **Uploads** | Multer |
| **Notifications** | Expo Server SDK |
| **Utilities** | Morgan, CORS, dotenv |

## 📁 Project Structure

```
candyapp-customer-backend/
├── config/        # Database & Firebase Admin setup
├── middleware/    # Auth, admin, super admin, screen-permission guards
├── models/        # User, Fruit, Cart, Order, Address, Notification, AdminNotification
├── routes/        # Express route modules
├── scripts/       # Utility scripts (promote a user to super admin)
└── index.js       # App entry point
```

## 🔌 API Overview

| Base Path | Purpose |
|---|---|
| `GET /api/health` | ❤️ Health check |
| `/api/auth` | 🔐 Register, login, admin login, Google login, refresh token, push token |
| `/api/fruits` | 🍭 Product list, search, CRUD |
| `/api/cart` | 🛒 Cart operations |
| `/api/orders` | 📦 Place orders, history, status updates |
| `/api/addresses` | 📍 Delivery addresses |
| `/api/notifications` | 🔔 Customer notifications |
| `/api/admin` & `/api/admin/permissions` | 🛡️ Admin endpoints and permissions |
| `/api/admin-notifications` | 📢 Admin order notifications |
| `/api/superadmin` | 👑 Super admin endpoints |

## 🚀 Getting Started

### 📋 Prerequisites

- ✅ Node.js 18 or higher
- ✅ A MongoDB database (local or Atlas)
- ✅ A Firebase project with a service account (for Google sign-in)

### 📥 Installation

```bash
git clone https://github.com/piyush22uk-cyber/candyapp-customer-backend.git
cd candyapp-customer-backend
npm install
```

### 🔧 Environment variables

Create a `.env` file in the project root:

```env
PORT=2005
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SUPERADMIN_EMAIL=your_superadmin_email
```

Place your Firebase service account key at `firebase-service-account.json` in the project root.

> ⚠️ Both files are git-ignored. **Never commit them.**

### ▶️ Run the server

```bash
npm run dev    # development (auto-reload)
npm start      # production
```

🌐 The server starts at `http://localhost:2005` by default.

### 👑 Create the first super admin

Register a normal user through the app or API, then promote it:

```bash
node scripts/promoteExistingUserToSuperAdmin.js
```

## 🔗 CandyApp Ecosystem

| Project | Description |
|---|---|
| 📱 [CandyApp](https://github.com/piyush22uk-cyber/CandyApp) | Customer mobile app |
| 🧑‍💼 [CandyAdminJS](https://github.com/piyush22uk-cyber/CandyAdminJS) | Admin mobile app |
| ⚙️ [candyapp-customer-backend](https://github.com/piyush22uk-cyber/candyapp-customer-backend) | REST API (this repo) |

## 👨‍💻 Author

**Piyush** • [@piyush22uk-cyber](https://github.com/piyush22uk-cyber)

<div align="center">

⭐ If you like this project, give it a star!

</div>
