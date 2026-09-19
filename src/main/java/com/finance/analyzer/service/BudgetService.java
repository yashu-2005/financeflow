package com.finance.analyzer.service;

import com.finance.analyzer.dto.BudgetDTO;
import com.finance.analyzer.entity.Budget;
import com.finance.analyzer.entity.TransactionType;
import com.finance.analyzer.repository.BudgetRepository;
import com.finance.analyzer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    public BudgetDTO setBudget(BudgetDTO dto) {
        if (dto.getAmount() == null || dto.getAmount().doubleValue() < 0) {
            throw new IllegalArgumentException("Budget amount must be zero or positive.");
        }

        Long userId = dto.getUserId() != null ? dto.getUserId() : 1L;
        LocalDate now = LocalDate.now();
        Integer month = dto.getMonth() != null ? dto.getMonth() : now.getMonthValue();
        Integer year = dto.getYear() != null ? dto.getYear() : now.getYear();

        Optional<Budget> existing = budgetRepository.findByUserIdAndBudgetMonthAndBudgetYear(userId, month, year);
        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setAmount(dto.getAmount());
        } else {
            budget = new Budget(userId, month, year, dto.getAmount());
        }

        Budget saved = budgetRepository.save(budget);
        return getCurrentBudget(userId, month, year);
    }

    public BudgetDTO getCurrentBudget(Long userId, Integer month, Integer year) {
        Long targetUserId = userId != null ? userId : 1L;
        LocalDate now = LocalDate.now();
        Integer targetMonth = month != null ? month : now.getMonthValue();
        Integer targetYear = year != null ? year : now.getYear();

        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndBudgetMonthAndBudgetYear(targetUserId, targetMonth, targetYear);
        BigDecimal budgetAmount = budgetOpt.map(Budget::getAmount).orElse(BigDecimal.valueOf(30000.00)); // Default default budget for initial render

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal usedAmount = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                targetUserId, TransactionType.EXPENSE, startDate, endDate);

        if (usedAmount == null) {
            usedAmount = BigDecimal.ZERO;
        }

        BigDecimal usedPercentage = BigDecimal.ZERO;
        if (budgetAmount.compareTo(BigDecimal.ZERO) > 0) {
            usedPercentage = usedAmount.multiply(BigDecimal.valueOf(100))
                    .divide(budgetAmount, 1, RoundingMode.HALF_UP);
        }

        String status;
        double pct = usedPercentage.doubleValue();
        if (pct < 70.0) {
            status = "NORMAL";
        } else if (pct < 90.0) {
            status = "WARNING"; // 70-90%
        } else if (pct <= 100.0) {
            status = "ALERT"; // 90-100%
        } else {
            status = "EXCEEDED"; // > 100%
        }

        BudgetDTO response = new BudgetDTO();
        response.setId(budgetOpt.map(Budget::getId).orElse(null));
        response.setUserId(targetUserId);
        response.setMonth(targetMonth);
        response.setYear(targetYear);
        response.setAmount(budgetAmount);
        response.setUsedAmount(usedAmount);
        response.setUsedPercentage(usedPercentage);
        response.setStatus(status);

        return response;
    }
}
