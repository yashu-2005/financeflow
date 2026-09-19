package com.finance.analyzer.controller;

import com.finance.analyzer.dto.CategoryExpenseDTO;
import com.finance.analyzer.dto.DashboardSummaryDTO;
import com.finance.analyzer.dto.MonthlyExpenseDTO;
import com.finance.analyzer.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // GET /api/analytics/summary - Total income, expenses, savings rate, budget % and insights
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        DashboardSummaryDTO summary = analyticsService.getDashboardSummary(userId, month, year);
        return ResponseEntity.ok(summary);
    }

    // GET /api/analytics/categories - Category breakdown for Pie/Doughnut Chart
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryExpenseDTO>> getCategories(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        List<CategoryExpenseDTO> categories = analyticsService.getCategoryExpenses(userId, month, year);
        return ResponseEntity.ok(categories);
    }

    // GET /api/analytics/monthly - Last 6 months expense data for Bar/Line Chart
    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyExpenseDTO>> getMonthlyTrends(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<MonthlyExpenseDTO> monthly = analyticsService.getMonthlyExpenses(userId);
        return ResponseEntity.ok(monthly);
    }
}
