/**
 * Personal Finance & Expense Analyzer - Frontend Client Logic
 * Author: CSE Fresher Portfolio Project
 * Stack: Vanilla JavaScript (ES6+), Fetch API, Chart.js
 */

const API_BASE = '/api';

// Chart Instance Holders
let categoryChartInstance = null;
let categoryDashChartInstance = null;
let monthlyTrendChartInstance = null;

// Category Lists
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Healthcare', 'Other'];
const INCOME_SOURCES = ['Salary', 'Freelancing', 'Gift', 'Other'];

// DOM Element Selectors
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTransactionForm();
    initBudgetForm();
    initFilters();

    // Default view initial load
    loadDashboardData();
    loadTransactions();
    loadAnalyticsData();
});

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
            if (btn.dataset.view === targetViewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        sections.forEach(sec => {
            if (sec.id === targetViewId) {
                sec.classList.add('active-view');
            } else {
                sec.classList.remove('active-view');
            }
        });

        if (viewTitles[targetViewId]) {
            pageTitle.textContent = viewTitles[targetViewId].title;
            pageSubtitle.textContent = viewTitles[targetViewId].subtitle;
        }

        // Trigger data refresh depending on active view
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
    try {
        const response = await fetch(`${API_BASE}/analytics/summary`);
        if (!response.ok) throw new Error('Failed to load summary');
        const data = await response.json();

        // Update Cards
        document.getElementById('val-income').textContent = formatCurrency(data.totalIncome);
        document.getElementById('val-expenses').textContent = formatCurrency(data.totalExpenses);
        document.getElementById('val-savings').textContent = formatCurrency(data.totalSavings);
        document.getElementById('val-savings-rate').textContent = `${data.savingsRate || 0}%`;
        document.getElementById('val-budget').textContent = formatCurrency(data.monthlyBudget);

        // Update Budget Progress Fill & Badge
        const fill = document.getElementById('val-budget-fill');
        const badge = document.getElementById('val-budget-badge');
        const pctText = document.getElementById('val-budget-pct');

        const pct = data.budgetUsedPercentage || 0;
        fill.style.width = `${Math.min(pct, 100)}%`;
        pctText.textContent = `${pct}% Used`;

        // Update status classes
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

        // Budget Alert Banner
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

        // Financial Insights
        document.getElementById('insight-main-text').textContent = data.insightMessage || 'No financial insights calculated yet.';
        document.getElementById('insight-highest-cat').textContent = data.highestSpendingCategory || '-';
        document.getElementById('insight-highest-amt').textContent = formatCurrency(data.highestSpendingCategoryAmount);
        document.getElementById('insight-lowest-cat').textContent = data.lowestSpendingCategory || '-';
        document.getElementById('insight-lowest-amt').textContent = formatCurrency(data.lowestSpendingCategoryAmount);
        document.getElementById('insight-avg-daily').textContent = formatCurrency(data.averageDailyExpense);
        document.getElementById('insight-highest-single').textContent = formatCurrency(data.highestSingleExpense);
        document.getElementById('insight-tx-count').textContent = data.totalTransactions || 0;

        // Render Dashboard Preview Doughnut Chart
        renderDashboardPreviewChart();

    } catch (err) {
        console.error('Error fetching dashboard summary:', err);
    }
}

/* ==========================================
   3. TRANSACTION FORM & CATEGORY TOGGLE
   ========================================== */
function initTransactionForm() {
    const form = document.getElementById('transaction-form');
    const categorySelect = document.getElementById('tx-category');
    const radios = document.getElementsByName('txType');
    const dateInput = document.getElementById('tx-date');

    // Set default date to today YYYY-MM-DD
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

    // Toggle radios style & category dropdown
    radios.forEach(r => {
        r.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-label').forEach(lbl => lbl.classList.remove('active'));
            e.target.closest('.radio-label').classList.add('active');
            populateCategories(e.target.value);
        });
    });

    // Initial populate
    populateCategories('EXPENSE');

    // Form submit listener
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

            // Switch back to dashboard
            document.getElementById('nav-dashboard').click();
        } catch (err) {
            alert('❌ Error: ' + err.message);
        }
    });
}

/* ==========================================
   4. TRANSACTION HISTORY TABLE, FILTERING & DELETION
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

    const url = `${API_BASE}/transactions?type=${typeFilter}&category=${categoryFilter}&sortBy=${sortBy}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const list = await res.json();

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

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:#ef4444;">Error loading data: ${err.message}</td></tr>`;
    }
}

async function deleteTransactionItem(id) {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;

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

        const now = new Date();
        const payload = {
            userId: 1,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            amount: amount
        };

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
    try {
        const res = await fetch(`${API_BASE}/analytics/categories`);
        if (!res.ok) return;
        const data = await res.json();

        const ctx = document.getElementById('dash-category-chart').getContext('2d');

        if (categoryDashChartInstance) {
            categoryDashChartInstance.destroy();
        }

        const labels = data.map(d => d.category);
        const amounts = data.map(d => d.amount);

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
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter' } } }
                }
            }
        });
    } catch (e) {
        console.error('Chart error:', e);
    }
}

async function loadAnalyticsData() {
    // 1. Category Doughnut Chart
    try {
        const resCat = await fetch(`${API_BASE}/analytics/categories`);
        const catData = await resCat.json();

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
                plugins: {
                    legend: { position: 'right', labels: { color: '#f8fafc', font: { family: 'Inter', size: 12 } } }
                }
            }
        });
    } catch (err) {
        console.error('Category analytics load error:', err);
    }

    // 2. 6-Month Trend Bar Chart
    try {
        const resMonthly = await fetch(`${API_BASE}/analytics/monthly`);
        const monthlyData = await resMonthly.json();

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
                plugins: {
                    legend: { labels: { color: '#f8fafc', font: { family: 'Inter' } } }
                }
            }
        });
    } catch (err) {
        console.error('Monthly trend chart error:', err);
    }
}

/* Helper Currency Formatter */
function formatCurrency(val) {
    if (val === undefined || val === null) return '₹0';
    const num = parseFloat(val);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
}
