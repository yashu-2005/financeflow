-- Sample Initial Data Seed for Personal Finance & Expense Analyzer

INSERT INTO users (id, name, email, password) 
VALUES (1, 'Fresher Student', 'student@college.edu', 'password123');

-- Current Month Sample Income Transactions
INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
VALUES 
(1, 'INCOME', 40000.00, 'Salary', 'Monthly Internship Stipend', CURRENT_DATE),
(1, 'INCOME', 5000.00, 'Freelancing', 'Web Design Project', CURRENT_DATE);

-- Current Month Sample Expense Transactions
INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
VALUES 
(1, 'EXPENSE', 6500.00, 'Food', 'Groceries & Dining Out', CURRENT_DATE),
(1, 'EXPENSE', 3500.00, 'Travel', 'Monthly Bus Pass & Fuel', CURRENT_DATE),
(1, 'EXPENSE', 8200.00, 'Shopping', 'New Laptop Accessories & Clothing', CURRENT_DATE),
(1, 'EXPENSE', 4500.00, 'Bills', 'Electricity & High-Speed WiFi', CURRENT_DATE),
(1, 'EXPENSE', 1800.00, 'Entertainment', 'Movie Tickets & Streaming', CURRENT_DATE);

-- Monthly Budget Seed (30,000 for Current Month)
INSERT INTO budgets (user_id, budget_month, budget_year, amount)
VALUES (1, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 30000.00);

