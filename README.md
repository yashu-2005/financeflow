# 💰 Personal Finance & Expense Analyzer

> A beginner-friendly, full-stack personal finance web application built using **Java, Spring Boot, REST APIs, PostgreSQL, HTML5, CSS3, Vanilla JavaScript, and Chart.js**. Designed for CSE fresher portfolio showcases.

---

## 📌 Project Overview

**Personal Finance & Expense Analyzer** is a web-based financial tracking system that enables users to log income and expense entries, categorize spending, establish monthly target budgets, calculate savings rates, and visualize spending habits through dynamic charts and automated insights.

### 🌟 Key Features

* 📊 **Financial Dashboard**: Real-time monthly metrics (Income, Expenses, Remaining Balance, Savings, Savings Rate, Monthly Budget, % Used, Transaction Count).
* 📥 **Income & Expense Tracker**: Record income sources (Salary, Freelancing, Gifts) and expense categories (Food, Travel, Shopping, Bills, Education, Entertainment, Healthcare).
* 📋 **Transaction History**: View all transactions in a clean data table with real-time filtering (by Type & Category), sorting (by Date & Amount), and item deletion.
* ⚠️ **Smart Budget Alert Engine**: Visual alerts & status badges based on budget threshold rules (<70% Normal, 70–90% Warning, >90% Alert, >100% Exceeded).
* 📈 **Chart.js Analytics**:
  * **Category-Wise Spending**: Doughnut chart illustrating percentage distribution per category.
  * **6-Month Trends**: Bar chart tracking historical monthly expenses.
* 💡 **Automated Insights Engine**: Automatically computes highest/lowest spending categories, average daily expense, and highest single purchase.

---

## 🛠️ Tech Stack

### Backend
* **Language**: Java (17 / 21)
* **Framework**: Spring Boot 3.2+ (Spring MVC, REST API)
* **Data Access**: Spring Data JPA / Hibernate ORM
* **Database**: PostgreSQL (Primary) / H2 (In-Memory Fallback)

### Frontend
* **UI**: HTML5, CSS3 (Modern Glassmorphic Dark Theme)
* **Scripting**: Vanilla JavaScript (ES6+, Fetch API)
* **Data Visualization**: Chart.js v4.x

---

## 📐 Architecture & Layer Structure

The project strictly separates concerns following the standard 3-tier Spring Boot architecture:

```
src/main/java/com/finance/analyzer/
├── PersonalFinanceApplication.java  # Spring Boot Application Launcher
├── config/
│   └── WebConfig.java                # CORS Configuration for API Access
├── controller/                       # REST Controllers (Receives JSON requests)
│   ├── TransactionController.java
│   ├── BudgetController.java
│   └── AnalyticsController.java
├── service/                          # Business Logic & Calculation Layer
│   ├── TransactionService.java
│   ├── BudgetService.java
│   └── AnalyticsService.java
├── repository/                       # Spring Data JPA Repository Layer
│   ├── UserRepository.java
│   ├── TransactionRepository.java
│   └── BudgetRepository.java
├── entity/                           # Database Entity Definitions
│   ├── User.java
│   ├── Transaction.java
│   ├── TransactionType.java (Enum: INCOME, EXPENSE)
│   └── Budget.java
├── dto/                              # Data Transfer Objects
│   ├── TransactionDTO.java
│   ├── BudgetDTO.java
│   ├── DashboardSummaryDTO.java
│   ├── CategoryExpenseDTO.java
│   └── MonthlyExpenseDTO.java
└── exception/                        # Global Error Handling
    ├── ResourceNotFoundException.java
    ├── ErrorResponse.java
    └── GlobalExceptionHandler.java
```

---

## 🗄️ Database Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'INCOME' or 'EXPENSE'
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets Table
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2000),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_month_year UNIQUE (user_id, month, year)
);
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/transactions` | Create a new income or expense transaction |
| `GET` | `/api/transactions` | Retrieve all transactions (supports `type`, `category`, `sortBy`) |
| `DELETE` | `/api/transactions/{id}` | Delete transaction by ID |
| `GET` | `/api/transactions/expenses` | Retrieve expense records only |
| `GET` | `/api/transactions/income` | Retrieve income records only |
| `GET` | `/api/analytics/summary` | Fetch dashboard summary metrics & insight text |
| `GET` | `/api/analytics/categories` | Fetch category expense breakdown for Pie chart |
| `GET` | `/api/analytics/monthly` | Fetch last 6 months expense data for Bar chart |
| `POST` | `/api/budgets` | Set or update target monthly budget |
| `GET` | `/api/budgets/current` | Fetch active monthly budget & percentage used |

---

## 🚀 How to Run the Project

### Prerequisites
* Java JDK 17 or higher
* PostgreSQL Database Server (Running on localhost:5432)

### Steps

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/personal-finance-analyzer.git
   cd personal-finance-analyzer
   ```

2. **Configure Database**:
   Create a database named `finance_db` in PostgreSQL:
   ```sql
   CREATE DATABASE finance_db;
   ```
   *(Optional)* If credentials differ, update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/finance_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```

3. **Run Application**:
   Using Maven:
   ```bash
   mvn spring-boot:run
   ```

4. **Access Web Application**:
   Open browser at: `http://localhost:8080`

---

## 🔮 Future Improvements
* 🔐 User Authentication (JWT + Spring Security).
* 📄 Export Transactions to CSV / PDF report.
* 📱 Progressive Web App (PWA) offline support.
