package com.finance.analyzer.controller;

import com.finance.analyzer.dto.TransactionDTO;
import com.finance.analyzer.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // POST /api/transactions - Add new transaction
    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO dto) {
        TransactionDTO created = transactionService.createTransaction(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // GET /api/transactions - Fetch all transactions with filtering/sorting
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "date_desc") String sortBy) {
        List<TransactionDTO> list = transactionService.getAllTransactions(userId, type, category, sortBy);
        return ResponseEntity.ok(list);
    }

    // GET /api/transactions/expenses - Fetch expenses only
    @GetMapping("/expenses")
    public ResponseEntity<List<TransactionDTO>> getExpenses(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<TransactionDTO> expenses = transactionService.getExpenses(userId);
        return ResponseEntity.ok(expenses);
    }

    // GET /api/transactions/income - Fetch income only
    @GetMapping("/income")
    public ResponseEntity<List<TransactionDTO>> getIncome(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<TransactionDTO> income = transactionService.getIncome(userId);
        return ResponseEntity.ok(income);
    }

    // DELETE /api/transactions/{id} - Delete transaction by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
