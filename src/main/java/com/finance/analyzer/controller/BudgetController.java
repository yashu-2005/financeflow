package com.finance.analyzer.controller;

import com.finance.analyzer.dto.BudgetDTO;
import com.finance.analyzer.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @Autowired
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // POST /api/budgets - Set or update monthly budget
    @PostMapping
    public ResponseEntity<BudgetDTO> setBudget(@RequestBody BudgetDTO dto) {
        BudgetDTO updated = budgetService.setBudget(dto);
        return ResponseEntity.ok(updated);
    }

    // GET /api/budgets/current - Get current active budget & percentage used
    @GetMapping("/current")
    public ResponseEntity<BudgetDTO> getCurrentBudget(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        BudgetDTO budget = budgetService.getCurrentBudget(userId, month, year);
        return ResponseEntity.ok(budget);
    }
}
