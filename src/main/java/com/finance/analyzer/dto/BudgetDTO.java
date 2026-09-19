package com.finance.analyzer.dto;

import java.math.BigDecimal;

public class BudgetDTO {

    private Long id;
    private Long userId;
    private Integer month;
    private Integer year;
    private BigDecimal amount;
    private BigDecimal usedAmount;
    private BigDecimal usedPercentage;
    private String status; // NORMAL, WARNING, ALERT, EXCEEDED

    public BudgetDTO() {}

    public BudgetDTO(Long id, Long userId, Integer month, Integer year, BigDecimal amount, BigDecimal usedAmount, BigDecimal usedPercentage, String status) {
        this.id = id;
        this.userId = userId;
        this.month = month;
        this.year = year;
        this.amount = amount;
        this.usedAmount = usedAmount;
        this.usedPercentage = usedPercentage;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public BigDecimal getUsedAmount() {
        return usedAmount;
    }

    public void setUsedAmount(BigDecimal usedAmount) {
        this.usedAmount = usedAmount;
    }

    public BigDecimal getUsedPercentage() {
        return usedPercentage;
    }

    public void setUsedPercentage(BigDecimal usedPercentage) {
        this.usedPercentage = usedPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
