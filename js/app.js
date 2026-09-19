/**
 * Personal Finance & Expense Analyzer - Frontend Client Logic
 * Author: CSE Fresher Portfolio Project
 * Stack: Vanilla JavaScript (ES6+), Fetch API, Chart.js
 * Dual-Mode: Full Spring Boot REST API (Primary) + LocalStorage Fallback (For Vercel Static Showcase)
 */

const API_BASE = '/api';

// Chart Instance Holders
let categoryChartInstance = null;
let categoryDashChartInstance = null;
let monthlyTrendChartInstance = null;

// Categories & Sources
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Healthcare', 'Other'];
const INCOME_SOURCES = ['Salary', 'Freelancing', 'Gift', 'Other'];

// Demo Seed State for LocalStorage Fallback (Vercel)
const DEFAULT_LOCAL_TRANSACTIONS = [
    { id: 1, type: 'INCOME', amount: 40000, category: 'Salary', description: 'Monthly Internship Stipend', transactionDate: getTodayOffset(-10) },
    { id: 2, type: 'INCOME', amount: 5000, category: 'Freelancing', description: 'Web Design Project', transactionDate: getTodayOffset(-5) },
    { id: 3, type: 'EXPENSE', amount: 6500, category: 'Food', description: 'Groceries & Dining Out', transactionDate: getTodayOffset(-12) },
    { id: 4, type: 'EXPENSE', amount: 3500, category: 'Travel', description: 'Monthly Bus Pass & Fuel', transactionDate: getTodayOffset(-9) },
    { id: 5, type: 'EXPENSE', amount: 8200, category: 'Shopping', description: 'New Laptop Accessories', transactionDate: getTodayOffset(-7) },
    { id: 6, type: 'EXPENSE', amount: 4500, category: 'Bills', description: 'Electricity & WiFi', transactionDate: getTodayOffset(-4) },
    { id: 7, type: 'EXPENSE', amount: 1800, category: 'Entertainment', description: 'Movie Tickets & Streaming', transactionDate: getTodayOffset(-2) }
];

let useLocalFallback = false;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTransactionForm();
    initBudgetForm();
    initFilters();

    // Initial load
    loadDashboardData();
    loadTransactions();
    loadAnalyticsData();
});

function getTodayOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

/* Local Storage Helper Functions for Vercel Static Fallback */
function getStoredTransactions() {
    const raw = localStorage.getItem('pfa_transactions');
    if (!raw) {
        localStorage.setItem('pfa_transactions', JSON.stringify(DEFAULT_LOCAL_TRANSACTIONS));
        return DEFAULT_LOCAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
}

function saveStoredTransactions(list) {
    localStorage.setItem('pfa_transactions', JSON.stringify(list));
}

function getStoredBudget() {
    const raw = localStorage.getItem('pfa_budget');
    return raw ? parseFloat(raw) : 30000;
}

function saveStoredBudget(amt) {
    localStorage.setItem('pfa_budget', amt.toString());
}

/* ==========================================
   1. NAVIGATION & TAB SWITCHING
   ========================================== */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const quickAddBtn = document.getElementById('btn-quick-add');

    const viewTitles = {
        'dashboard-view': { title: 'Financial Dashboard', subtitle: 'Track income, spending habits, and monthly savings targets.' },
        'add-transaction-view': { title: 'Add New Record', subtitle: 'Record income sources or categorized expense transactions.' },
        'transactions-view': { title: 'Transaction History', subtitle: 'View, filter, sort, and manage all your past financial records.' },
        'analytics-view': { title: 'Monthly Spending Analysis', subtitle: 'Visual charts analyzing category distribution and 6-month trends.' },
        'budget-view': { title: 'Budget Management', subtitle: 'Set spending limits and monitor budget alert thresholds.' }
    };

    function switchView(targetViewId) {
        navButtons.forEach(btn => {
            if (btn.dataset.view === targetViewId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        sections.forEach(sec => {
            if (sec.id === targetViewId) sec.classList.add('active-view');
            else sec.classList.remove('active-view');
        });

        if (viewTitles[targetViewId]) {
            pageTitle.textContent = viewTitles[targetViewId].title;
            pageSubtitle.textContent = viewTitles[targetViewId].subtitle;
        }

        if (targetViewId === 'dashboard-view') loadDashboardData();
        if (targetViewId === 'transactions-view') loadTransactions();
        if (targetViewId === 'analytics-view') loadAnalyticsData();
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => switchView('add-transaction-view'));
    }
}

/* ==========================================
   2. DASHBOARD & SUMMARY METRICS
   ========================================== */
async function loadDashboardData() {
    let data;

    try {
        const response = await fetch(`${API_BASE}/analytics/summary`);
        if (!response.ok) throw new Error('API un-reachable');
        data = await response.json();
        useLocalFallback = false;
    } catch (err) {
        // Active LocalStorage Fallback mode for Vercel Static Hosting
        useLocalFallback = true;
        data = computeLocalSummary();
    }

    renderDashboardUI(data);
}

function computeLocalSummary() {
    const list = getStoredTransactions();
    const monthlyBudget = getStoredBudget();

    let totalIncome = 0;
    let totalExpenses = 0;
    const catMap = {};
    let highestSingleExpense = 0;

    list.forEach(t => {
        const amt = parseFloat(t.amount);
        if (t.type === 'INCOME') {
            totalIncome += amt;
        } else {
            totalExpenses += amt;
            catMap[t.category] = (catMap[t.category] || 0) + amt;
            if (amt > highestSingleExpense) highestSingleExpense = amt;
        }
    });

    const totalSavings = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;
    const budgetUsedPercentage = monthlyBudget > 0 ? ((totalExpenses / monthlyBudget) * 100).toFixed(1) : 0;

    let budgetStatus = 'NORMAL';
    if (budgetUsedPercentage >= 100) budgetStatus = 'EXCEEDED';
    else if (budgetUsedPercentage >= 90) budgetStatus = 'ALERT';
    else if (budgetUsedPercentage >= 70) budgetStatus = 'WARNING';

    // Categories
    let highestCat = 'None', highestAmt = 0;
    let lowestCat = 'None', lowestAmt = Infinity;

    Object.keys(catMap).forEach(cat => {
        const val = catMap[cat];
        if (val > highestAmt) { highestAmt = val; highestCat = cat; }
        if (val < lowestAmt) { lowestAmt = val; lowestCat = cat; }
    });
    if (lowestAmt === Infinity) lowestAmt = 0;

    const avgDailyExpense = (totalExpenses / 30).toFixed(2);

    let insightMessage = '';
    if (highestCat !== 'None') {
        insightMessage = `${highestCat} is your highest spending category this month at ₹${highestAmt}. `;
    }
    if (parseFloat(savingsRate) >= 30) {
        insightMessage += `Great job! You saved ${savingsRate}% of your income this month.`;
    } else if (totalExpenses > totalIncome) {
        insightMessage += `⚠️ Alert: Your monthly expenses exceed your total income.`;
    } else {
        insightMessage += `Tip: Aim to save at least 20% of your total income.`;
    }

    return {
        totalIncome,
        totalExpenses,
        remainingBalance: totalIncome - totalExpenses,
        totalSavings,
        savingsRate,
        monthlyBudget,
        budgetUsedPercentage,
        budgetStatus,
        totalTransactions: list.length,
        highestSpendingCategory: highestCat,
        highestSpendingCategoryAmount: highestAmt,
        lowestSpendingCategory: lowestCat,
        lowestSpendingCategoryAmount: lowestAmt,
        averageDailyExpense: avgDailyExpense,
        highestSingleExpense: highestSingleExpense,
        insightMessage
    };
}

function renderDashboardUI(data) {
    document.getElementById('val-income').textContent = formatCurrency(data.totalIncome);
    document.getElementById('val-expenses').textContent = formatCurrency(data.totalExpenses);
    document.getElementById('val-savings').textContent = formatCurrency(data.totalSavings);
    document.getElementById('val-savings-rate').textContent = `${data.savingsRate || 0}%`;
    document.getElementById('val-budget').textContent = formatCurrency(data.monthlyBudget);

    const fill = document.getElementById('val-budget-fill');
    const badge = document.getElementById('val-budget-badge');
    const pctText = document.getElementById('val-budget-pct');

    const pct = data.budgetUsedPercentage || 0;
    fill.style.width = `${Math.min(pct, 100)}%`;
    pctText.textContent = `${pct}% Used`;

    fill.className = 'progress-fill';
    badge.className = 'card-badge';

    if (data.budgetStatus === 'WARNING') {
        fill.classList.add('status-warning');
        badge.classList.add('badge-yellow');
        badge.textContent = '70-90% Used';
    } else if (data.budgetStatus === 'ALERT') {
        fill.classList.add('status-alert');
        badge.classList.add('badge-red');
        badge.textContent = '>90% Alert';
    } else if (data.budgetStatus === 'EXCEEDED') {
        fill.classList.add('status-exceeded');
        badge.classList.add('badge-red');
        badge.textContent = 'Exceeded!';
    } else {
        badge.classList.add('badge-green');
        badge.textContent = 'Normal (<70%)';
    }

    const alertBanner = document.getElementById('budget-alert-banner');
    const alertText = document.getElementById('alert-message-text');

    if (pct >= 70.0) {
        alertBanner.classList.remove('hidden');
        if (pct >= 100.0) {
            alertBanner.className = 'alert-banner alert-exceeded';
            alertText.textContent = `🚨 Budget Exceeded! You have used ${pct}% of your monthly target budget.`;
        } else if (pct >= 90.0) {
            alertBanner.className = 'alert-banner alert-exceeded';
            alertText.textContent = `⚠️ Critical Alert: You have used ${pct}% of your monthly target budget.`;
        } else {
            alertBanner.className = 'alert-banner';
            alertText.textContent = `⚠️ Warning: You have used ${pct}% of your monthly target budget.`;
        }
    } else {
        alertBanner.classList.add('hidden');
    }

    document.getElementById('insight-main-text').textContent = data.insightMessage || 'No financial insights calculated yet.';
    document.getElementById('insight-highest-cat').textContent = data.highestSpendingCategory || '-';
    document.getElementById('insight-highest-amt').textContent = formatCurrency(data.highestSpendingCategoryAmount);
    document.getElementById('insight-lowest-cat').textContent = data.lowestSpendingCategory || '-';
    document.getElementById('insight-lowest-amt').textContent = formatCurrency(data.lowestSpendingCategoryAmount);
    document.getElementById('insight-avg-daily').textContent = formatCurrency(data.averageDailyExpense);
    document.getElementById('insight-highest-single').textContent = formatCurrency(data.highestSingleExpense);
    document.getElementById('insight-tx-count').textContent = data.totalTransactions || 0;

    renderDashboardPreviewChart();
}

/* ==========================================
   3. TRANSACTION FORM
   ========================================== */
function initTransactionForm() {
    const form = document.getElementById('transaction-form');
    const categorySelect = document.getElementById('tx-category');
    const radios = document.getElementsByName('txType');
    const dateInput = document.getElementById('tx-date');

    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    function populateCategories(type) {
        categorySelect.innerHTML = '';
        const list = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_SOURCES;
        list.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categorySelect.appendChild(opt);
        });
    }

    radios.forEach(r => {
        r.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-label').forEach(lbl => lbl.classList.remove('active'));
            e.target.closest('.radio-label').classList.add('active');
            populateCategories(e.target.value);
        });
    });

    populateCategories('EXPENSE');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedType = document.querySelector('input[name="txType"]:checked').value;
        const amount = parseFloat(document.getElementById('tx-amount').value);
        const date = document.getElementById('tx-date').value;
        const category = document.getElementById('tx-category').value;
        const description = document.getElementById('tx-description').value;

        const payload = {
            userId: 1,
            type: selectedType,
            amount: amount,
            category: category,
            description: description,
            transactionDate: date
        };

        if (useLocalFallback) {
            const stored = getStoredTransactions();
            payload.id = Date.now();
            stored.unshift(payload);
            saveStoredTransactions(stored);
            alert('✅ Transaction saved successfully! (Demo Mode)');
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            populateCategories(selectedType);
            document.getElementById('nav-dashboard').click();
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errJson = await res.json();
                throw new Error(errJson.message || 'Failed to save transaction');
            }

            alert('✅ Transaction saved successfully!');
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            populateCategories(selectedType);
            document.getElementById('nav-dashboard').click();
        } catch (err) {
            alert('❌ Error: ' + err.message);
        }
    });
}

/* ==========================================
   4. TRANSACTION TABLE & FILTERS
   ========================================== */
function initFilters() {
    document.getElementById('filter-type').addEventListener('change', loadTransactions);
    document.getElementById('filter-category').addEventListener('change', loadTransactions);
    document.getElementById('sort-by').addEventListener('change', loadTransactions);
}

async function loadTransactions() {
    const tbody = document.getElementById('transaction-table-body');
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const sortBy = document.getElementById('sort-by').value;

    let list = [];

    if (useLocalFallback) {
        list = getStoredTransactions();
        if (typeFilter !== 'ALL') list = list.filter(t => t.type === typeFilter);
        if (categoryFilter !== 'ALL') list = list.filter(t => t.category.toLowerCase() === categoryFilter.toLowerCase());
        
        if (sortBy === 'amount_asc') list.sort((a,b) => a.amount - b.amount);
        else if (sortBy === 'amount_desc') list.sort((a,b) => b.amount - a.amount);
        else if (sortBy === 'date_asc') list.sort((a,b) => new Date(a.transactionDate) - new Date(b.transactionDate));
        else list.sort((a,b) => new Date(b.transactionDate) - new Date(a.transactionDate));

        renderTransactionTable(list);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/transactions?type=${typeFilter}&category=${categoryFilter}&sortBy=${sortBy}`);
        if (!res.ok) throw new Error('API Error');
        list = await res.json();
        renderTransactionTable(list);
    } catch (err) {
        useLocalFallback = true;
        loadTransactions();
    }
}

function renderTransactionTable(list) {
    const tbody = document.getElementById('transaction-table-body');
    document.getElementById('table-record-count').textContent = `${list.length} Records`;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No transactions found matching criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(t => {
        const isIncome = t.type === 'INCOME';
        const pillClass = isIncome ? 'type-income' : 'type-expense';
        const amountClass = isIncome ? 'amount-income' : 'amount-expense';
        const prefix = isIncome ? '+ ' : '- ';

        return `
            <tr>
                <td>${t.transactionDate}</td>
                <td><span class="type-pill ${pillClass}">${t.type}</span></td>
                <td><strong>${t.category}</strong></td>
                <td>${t.description || '-'}</td>
                <td class="${amountClass}">${prefix}${formatCurrency(t.amount)}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteTransactionItem(${t.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteTransactionItem(id) {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;

    if (useLocalFallback) {
        let stored = getStoredTransactions();
        stored = stored.filter(t => t.id !== id);
        saveStoredTransactions(stored);
        loadTransactions();
        loadDashboardData();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete transaction');
        loadTransactions();
        loadDashboardData();
    } catch (err) {
        alert('❌ Error deleting transaction: ' + err.message);
    }
}

/* ==========================================
   5. BUDGET FORM
   ========================================== */
function initBudgetForm() {
    const form = document.getElementById('budget-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('budget-amount').value);

        if (useLocalFallback) {
            saveStoredBudget(amount);
            alert('🎯 Monthly budget updated successfully! (Demo Mode)');
            loadDashboardData();
            document.getElementById('nav-dashboard').click();
            return;
        }

        const now = new Date();
        const payload = { userId: 1, month: now.getMonth() + 1, year: now.getFullYear(), amount: amount };

        try {
            const res = await fetch(`${API_BASE}/budgets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update budget');

            alert('🎯 Monthly budget updated successfully!');
            loadDashboardData();
            document.getElementById('nav-dashboard').click();
        } catch (err) {
            alert('❌ Error updating budget: ' + err.message);
        }
    });
}

/* ==========================================
   6. CHART.JS VISUALIZATIONS
   ========================================== */
async function renderDashboardPreviewChart() {
    let catData = [];

    if (useLocalFallback) {
        const list = getStoredTransactions().filter(t => t.type === 'EXPENSE');
        const catMap = {};
        list.forEach(t => catMap[t.category] = (catMap[t.category] || 0) + parseFloat(t.amount));
        catData = Object.keys(catMap).map(c => ({ category: c, amount: catMap[c] }));
    } else {
        try {
            const res = await fetch(`${API_BASE}/analytics/categories`);
            if (res.ok) catData = await res.json();
        } catch (e) {}
    }

    const ctx = document.getElementById('dash-category-chart').getContext('2d');
    if (categoryDashChartInstance) categoryDashChartInstance.destroy();

    const labels = catData.map(d => d.category);
    const amounts = catData.map(d => d.amount);

    categoryDashChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['No Expenses'],
            datasets: [{
                data: amounts.length ? amounts : [1],
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#64748b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter' } } } }
        }
    });
}

async function loadAnalyticsData() {
    let catData = [];
    let monthlyData = [];

    if (useLocalFallback) {
        const list = getStoredTransactions().filter(t => t.type === 'EXPENSE');
        let total = 0;
        const catMap = {};
        list.forEach(t => {
            const amt = parseFloat(t.amount);
            total += amt;
            catMap[t.category] = (catMap[t.category] || 0) + amt;
        });

        catData = Object.keys(catMap).map(c => ({
            category: c,
            amount: catMap[c],
            percentage: total > 0 ? ((catMap[c] / total) * 100).toFixed(1) : 0
        }));

        monthlyData = [
            { monthName: 'Apr', amount: 18000 },
            { monthName: 'May', amount: 21000 },
            { monthName: 'Jun', amount: 19500 },
            { monthName: 'Jul', amount: 24000 },
            { monthName: 'Aug', amount: 22500 },
            { monthName: 'Sep', amount: total }
        ];
    } else {
        try {
            const resCat = await fetch(`${API_BASE}/analytics/categories`);
            catData = await resCat.json();
            const resMonthly = await fetch(`${API_BASE}/analytics/monthly`);
            monthlyData = await resMonthly.json();
        } catch (err) {}
    }

    // Doughnut Chart
    const ctxCat = document.getElementById('category-doughnut-chart').getContext('2d');
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: catData.map(c => `${c.category} (${c.percentage}%)`),
            datasets: [{
                data: catData.map(c => c.amount),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#64748b'],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#f8fafc', font: { family: 'Inter', size: 12 } } } }
        }
    });

    // Bar Chart
    const ctxMonthly = document.getElementById('monthly-trend-chart').getContext('2d');
    if (monthlyTrendChartInstance) monthlyTrendChartInstance.destroy();

    monthlyTrendChartInstance = new Chart(ctxMonthly, {
        type: 'bar',
        data: {
            labels: monthlyData.map(m => m.monthName),
            datasets: [{
                label: 'Monthly Expenses (₹)',
                data: monthlyData.map(m => m.amount),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            },
            plugins: { legend: { labels: { color: '#f8fafc', font: { family: 'Inter' } } } }
        }
    });
}

function formatCurrency(val) {
    if (val === undefined || val === null) return '₹0';
    const num = parseFloat(val);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
}
