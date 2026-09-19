package com.finance.analyzer.service;

import com.finance.analyzer.dto.BudgetDTO;
import com.finance.analyzer.dto.CategoryExpenseDTO;
import com.finance.analyzer.dto.DashboardSummaryDTO;
import com.finance.analyzer.dto.MonthlyExpenseDTO;
import com.finance.analyzer.entity.Transaction;
import com.finance.analyzer.entity.TransactionType;
import com.finance.analyzer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;

    @Autowired
    public AnalyticsService(TransactionRepository transactionRepository, BudgetService budgetService) {
        this.transactionRepository = transactionRepository;
        this.budgetService = budgetService;
    }

    public DashboardSummaryDTO getDashboardSummary(Long userId, Integer month, Integer year) {
        Long targetUserId = userId != null ? userId : 1L;
        LocalDate now = LocalDate.now();
        Integer targetMonth = month != null ? month : now.getMonthValue();
        Integer targetYear = year != null ? year : now.getYear();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        // Income & Expenses for target month
        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                targetUserId, TransactionType.INCOME, startDate, endDate);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                targetUserId, TransactionType.EXPENSE, startDate, endDate);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        // Remaining Balance & Total Savings = Income - Expenses
        BigDecimal totalSavings = totalIncome.subtract(totalExpenses);
        if (totalSavings.compareTo(BigDecimal.ZERO) < 0) {
            totalSavings = BigDecimal.ZERO;
        }

        BigDecimal remainingBalance = totalIncome.subtract(totalExpenses);

        // Savings Rate = (Savings / Income) * 100
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = totalSavings.multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 1, RoundingMode.HALF_UP);
        }

        // Budget Metrics
        BudgetDTO budgetDTO = budgetService.getCurrentBudget(targetUserId, targetMonth, targetYear);

        // All transactions list for current month
        List<Transaction> monthTransactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(targetUserId, startDate, endDate);

        long totalTransactions = monthTransactions.size();

        // Category breakdown calculation
        List<Object[]> catResults = transactionRepository.sumExpensesGroupedByCategory(targetUserId, startDate, endDate);
        String highestCat = "None";
        BigDecimal highestCatAmt = BigDecimal.ZERO;
        String lowestCat = "None";
        BigDecimal lowestCatAmt = BigDecimal.ZERO;

        if (catResults != null && !catResults.isEmpty()) {
            Object[] first = catResults.get(0);
            highestCat = (String) first[0];
            highestCatAmt = (BigDecimal) first[1];

            Object[] last = catResults.get(catResults.size() - 1);
            lowestCat = (String) last[0];
            lowestCatAmt = (BigDecimal) last[1];
        }

        // Average Daily Expense = Total Expenses / Total Days in Month
        int daysInMonth = ym.lengthOfMonth();
        BigDecimal avgDailyExpense = totalExpenses.divide(BigDecimal.valueOf(daysInMonth), 2, RoundingMode.HALF_UP);

        // Highest Single Expense
        BigDecimal highestSingleExpense = monthTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Dynamic Insights Message Generator
        StringBuilder insight = new StringBuilder();
        if (!highestCat.equals("None")) {
            insight.append(highestCat).append(" is your highest spending category this month at ₹")
                   .append(highestCatAmt.setScale(0, RoundingMode.HALF_UP)).append(". ");
        }
        if (savingsRate.compareTo(BigDecimal.valueOf(30)) >= 0) {
            insight.append("Great job! You saved ").append(savingsRate).append("% of your income this month.");
        } else if (totalExpenses.compareTo(totalIncome) > 0) {
            insight.append("⚠️ Alert: Your monthly expenses exceed your total income.");
        } else {
            insight.append("Tip: Aim to save at least 20% of your total income.");
        }

        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpenses(totalExpenses);
        summary.setRemainingBalance(remainingBalance);
        summary.setTotalSavings(totalSavings);
        summary.setSavingsRate(savingsRate);
        summary.setMonthlyBudget(budgetDTO.getAmount());
        summary.setBudgetUsedPercentage(budgetDTO.getUsedPercentage());
        summary.setBudgetStatus(budgetDTO.getStatus());
        summary.setTotalTransactions(totalTransactions);

        summary.setHighestSpendingCategory(highestCat);
        summary.setHighestSpendingCategoryAmount(highestCatAmt);
        summary.setLowestSpendingCategory(lowestCat);
        summary.setLowestSpendingCategoryAmount(lowestCatAmt);
        summary.setAverageDailyExpense(avgDailyExpense);
        summary.setHighestSingleExpense(highestSingleExpense);
        summary.setInsightMessage(insight.toString());

        return summary;
    }

    public List<CategoryExpenseDTO> getCategoryExpenses(Long userId, Integer month, Integer year) {
        Long targetUserId = userId != null ? userId : 1L;
        LocalDate now = LocalDate.now();
        Integer targetMonth = month != null ? month : now.getMonthValue();
        Integer targetYear = year != null ? year : now.getYear();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Object[]> rawList = transactionRepository.sumExpensesGroupedByCategory(targetUserId, startDate, endDate);
        List<CategoryExpenseDTO> result = new ArrayList<>();

        BigDecimal total = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                targetUserId, TransactionType.EXPENSE, startDate, endDate);
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) {
            return result;
        }

        for (Object[] row : rawList) {
            String cat = (String) row[0];
            BigDecimal amt = (BigDecimal) row[1];
            BigDecimal pct = amt.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
            result.add(new CategoryExpenseDTO(cat, amt, pct));
        }

        return result;
    }

    public List<MonthlyExpenseDTO> getMonthlyExpenses(Long userId) {
        Long targetUserId = userId != null ? userId : 1L;
        LocalDate now = LocalDate.now();
        List<MonthlyExpenseDTO> list = new ArrayList<>();

        // Generate past 6 months
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            BigDecimal sum = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                    targetUserId, TransactionType.EXPENSE, start, end);
            if (sum == null) sum = BigDecimal.ZERO;

            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            list.add(new MonthlyExpenseDTO(monthName, ym.getMonthValue(), ym.getYear(), sum));
        }

        return list;
    }
}
