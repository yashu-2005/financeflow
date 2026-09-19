package com.finance.analyzer.repository;

import com.finance.analyzer.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserIdAndBudgetMonthAndBudgetYear(Long userId, Integer budgetMonth, Integer budgetYear);
}
