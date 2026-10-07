# FinSight — Smart Expense & Financial Planning System

> **College Computer Engineering Project-Based Learning (PBL) Project**  
> *Track → Analyze → Predict → Plan*

---

## 🌟 Executive Overview
**FinSight** is a full-stack personal finance and predictive planning platform designed for **students, young individuals, young professionals, and individuals beginning personal financial management**. It bridges the gap between passive transaction recording and forward-looking financial discipline by integrating transaction tracking, real-time category budget monitoring, milestone savings goals, visual analytics, and future expense forecasting powered by an explainable Machine Learning microservice.

---

## 🏗️ System Architecture

```text
                     +---------------------------------------+
                     |         React.js Web Client           |
                     |  (Vite + React Router + Recharts)     |
                     +-------------------+-------------------+
                                         |
                                HTTP REST|Requests (JWT Bearer)
                                         v
                     +---------------------------------------+
                     |     Node.js + Express.js API Server   |
                     |   (Auth, Transactions, Budgets, Goals)|
                     +---------+-------------------+---------+
                               |                   |
               Mongoose Driver |                   | HTTP POST /predict
                               v                   v
                     +-------------------+   +------------------------------------+
                     |   MongoDB Server  |   |    Python FastAPI ML Service       |
                     |  (Local / Atlas)  |   | (Pandas, NumPy, scikit-learn OLS)  |
                     +-------------------+   +------------------------------------+
```

### Decoupled ML Design Rationale
- **Separation of Concerns**: The Node.js server manages authenticated client sessions, CRUD endpoints, and database interactions, while the Python FastAPI service handles numeric processing and regression modeling.
- **Explainability for Viva**: Uses Ordinary Least Squares (OLS) Linear Trend Regression with strict guardrails rather than black-box deep learning.
- **Minimum-History Guardrail**: Requires at least 3 distinct calendar months of historical spending before making predictions. If fewer exist, it gracefully returns `insufficient_data` with actionable advice.

---

## 🚀 Key Features

| Module | Features |
| :--- | :--- |
| **Authentication** | Registration, Login, JWT tokens, bcryptjs password hashing, isolated user data |
| **Transactions** | CRUD for Income & Expenses, categories, UPI/Card/Cash/Bank Transfer methods, date pickers |
| **Budgets** | Category-level monthly limits, live spent vs budget computation, **overspending alert badges** |
| **Savings Goals** | Target amount, deadlines, deposit tracking, automated calculation of **required monthly savings** |
| **Dashboard** | Dynamic summary cards (Inflow, Outflow, Balance, Savings), recent transactions, ML preview |
| **Analytics** | 12-month cashflow bar charts, category donut distributions, payment method breakdowns (Recharts) |
| **ML Prediction** | Future monthly expense projection, trend direction (`upward`, `downward`, `stable`), $R^2$ fit, disclaimer |

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Styling**: Vanilla CSS Design System with dark fintech palette (`#071210`, `#0E6B5C`, `#3FBF9F`, `#E6A73C`)
- **Navigation**: React Router DOM (v7)
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios (with JWT interceptors)

### Backend
- **Runtime**: Node.js v24
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JSON Web Tokens (JWT) & bcryptjs

### Machine Learning Service
- **Framework**: Python 3.13 + FastAPI + Uvicorn
- **Data Engineering**: Pandas & NumPy
- **Regression Modeling**: scikit-learn (`LinearRegression`)

---

## ⚡ Quick Start & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://python.org/) (v3.10+)
- [MongoDB](https://www.mongodb.com/) (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Environment Configuration
Create a `.env` in `server/` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/finsight
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://127.0.0.1:8000
```

### 3. Run the ML Service (FastAPI)
```bash
cd ml-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Run the Backend API (Node.js)
```bash
cd server
npm install
npm run seed     # Seeds demo user with 4 months of realistic transactions
npm run dev      # Runs Express server on port 5000
```

### 5. Run the Frontend (React Vite)
```bash
cd client
npm install
npm run dev      # Runs React client on port 5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo & Testing Credentials

For quick viva evaluation or review, use the pre-seeded account:
- **Email**: `demo@finsight.com`
- **Password**: `Password123`
*(Or click the **Auto Fill** button directly on the `/login` page).*

This demo account is pre-populated with:
- 4 months of categorized income and expenses (Groceries, Tech, Metro, Subscriptions, Courses).
- Category budgets with active spending calculations.
- Savings goals with progress and remaining deadlines.
- Ready-to-evaluate ML expense predictions!

---

## 🧪 Testing & Validation

Run the automated End-to-End Acceptance Test Suite:
```bash
node server/utils/testWorkflow.js
```
This tests all 20 final acceptance criteria:
1. User registration & duplicate check
2. JWT token validation & protected routes
3. Minimum 3-month history guardrail (`insufficient_data`)
4. Income and expense creation
5. Category-wise budget and overspending flag verification
6. Savings goal creation, deposit, and deadline calculation
7. Real-time dynamic dashboard summary calculation
8. Multi-month scikit-learn regression prediction
9. Database persistence verification across re-login

---

## 🎓 PBL Viva Presentation Guide

### 1. Why was MERN Stack chosen?
- The MERN stack (MongoDB, Express, React, Node) provides a unified JavaScript/JSON ecosystem. MongoDB's flexible document model natively accommodates evolving transaction attributes and variable category tags.

### 2. Why is the Machine Learning service decoupled in Python FastAPI?
- Node.js is optimal for high-throughput, non-blocking asynchronous I/O (handling thousands of client requests), whereas Python has the premier data science ecosystem (NumPy, Pandas, scikit-learn). Decoupling via FastAPI preserves separation of concerns and allows independent scaling.

### 3. Why Linear Regression instead of Deep Learning?
- Personal financial records for an individual typically comprise dozens to hundreds of monthly aggregate points, where deep neural networks would severely overfit. Linear trend regression is statistically sound, fast, interpretable, and explainable in viva examinations.

### 4. How does the Minimum-History rule work?
- FinSight enforces a 3-month minimum threshold. If a user has fewer than 3 distinct calendar months of expenditure records, the system returns `insufficient_data` rather than guessing, maintaining ethical AI standards.

---

## 🌍 UN Sustainable Development Goals (SDG) Alignment
FinSight contributes to global sustainable development through personal financial awareness and literacy:
- **SDG 1: No Poverty** — Enhances financial resilience through emergency fund tracking and debt prevention.
- **SDG 4: Quality Education** — Promotes financial literacy, transforming transaction numbers into intuitive charts and forecasts.
- **SDG 8: Decent Work & Economic Growth** — Assists individuals with variable and freelance incomes in planning capital allocation.
- **SDG 10: Reduced Inequalities** — Offers open, accessible financial management tools without paywalls.

---

## 📜 Disclaimer
FinSight predictions are statistical estimates based on historical spending patterns and do not constitute guaranteed financial or investment advice.
