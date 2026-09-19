package com.finance.analyzer.dto;

import java.math.BigDecimal;

public class CategoryExpenseDTO {
    private String category;
    private BigDecimal amount;
    private BigDecimal percentage;

    public CategoryExpenseDTO() {}

    public CategoryExpenseDTO(String category, BigDecimal amount, BigDecimal percentage) {
        this.category = category;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }
}
