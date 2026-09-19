package com.finance.analyzer.dto;

import java.math.BigDecimal;

public class DashboardSummaryDTO {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal remainingBalance;
    private BigDecimal totalSavings;
    private BigDecimal savingsRate;
    private BigDecimal monthlyBudget;
    private BigDecimal budgetUsedPercentage;
    private String budgetStatus; // NORMAL, WARNING, ALERT, EXCEEDED
    private Long totalTransactions;
    
    // Insights
    private String highestSpendingCategory;
    private BigDecimal highestSpendingCategoryAmount;
    private String lowestSpendingCategory;
    private BigDecimal lowestSpendingCategoryAmount;
    private BigDecimal averageDailyExpense;
    private BigDecimal highestSingleExpense;
    private String insightMessage;

    public DashboardSummaryDTO() {}

    // Getters and Setters
    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public BigDecimal getTotalSavings() {
        return totalSavings;
    }

    public void setTotalSavings(BigDecimal totalSavings) {
        this.totalSavings = totalSavings;
    }

    public BigDecimal getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(BigDecimal savingsRate) {
        this.savingsRate = savingsRate;
    }

    public BigDecimal getMonthlyBudget() {
        return monthlyBudget;
    }

    public void setMonthlyBudget(BigDecimal monthlyBudget) {
        this.monthlyBudget = monthlyBudget;
    }

    public BigDecimal getBudgetUsedPercentage() {
        return budgetUsedPercentage;
    }

    public void setBudgetUsedPercentage(BigDecimal budgetUsedPercentage) {
        this.budgetUsedPercentage = budgetUsedPercentage;
    }

    public String getBudgetStatus() {
        return budgetStatus;
    }

    public void setBudgetStatus(String budgetStatus) {
        this.budgetStatus = budgetStatus;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public String getHighestSpendingCategory() {
        return highestSpendingCategory;
    }

    public void setHighestSpendingCategory(String highestSpendingCategory) {
        this.highestSpendingCategory = highestSpendingCategory;
    }

    public BigDecimal getHighestSpendingCategoryAmount() {
        return highestSpendingCategoryAmount;
    }

    public void setHighestSpendingCategoryAmount(BigDecimal highestSpendingCategoryAmount) {
        this.highestSpendingCategoryAmount = highestSpendingCategoryAmount;
    }

    public String getLowestSpendingCategory() {
        return lowestSpendingCategory;
    }

    public void setLowestSpendingCategory(String lowestSpendingCategory) {
        this.lowestSpendingCategory = lowestSpendingCategory;
    }

    public BigDecimal getLowestSpendingCategoryAmount() {
        return lowestSpendingCategoryAmount;
    }

    public void setLowestSpendingCategoryAmount(BigDecimal lowestSpendingCategoryAmount) {
        this.lowestSpendingCategoryAmount = lowestSpendingCategoryAmount;
    }

    public BigDecimal getAverageDailyExpense() {
        return averageDailyExpense;
    }

    public void setAverageDailyExpense(BigDecimal averageDailyExpense) {
        this.averageDailyExpense = averageDailyExpense;
    }

    public BigDecimal getHighestSingleExpense() {
        return highestSingleExpense;
    }

    public void setHighestSingleExpense(BigDecimal highestSingleExpense) {
        this.highestSingleExpense = highestSingleExpense;
    }

    public String getInsightMessage() {
        return insightMessage;
    }

    public void setInsightMessage(String insightMessage) {
        this.insightMessage = insightMessage;
    }
}
