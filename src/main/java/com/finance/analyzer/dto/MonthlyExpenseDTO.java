package com.finance.analyzer.dto;

import java.math.BigDecimal;

public class MonthlyExpenseDTO {
    private String monthName; // e.g. "April", "May", "June"
    private Integer month;
    private Integer year;
    private BigDecimal amount;

    public MonthlyExpenseDTO() {}

    public MonthlyExpenseDTO(String monthName, Integer month, Integer year, BigDecimal amount) {
        this.monthName = monthName;
        this.month = month;
        this.year = year;
        this.amount = amount;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
