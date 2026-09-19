package com.finance.analyzer.service;

import com.finance.analyzer.dto.TransactionDTO;
import com.finance.analyzer.entity.Transaction;
import com.finance.analyzer.entity.TransactionType;
import com.finance.analyzer.exception.ResourceNotFoundException;
import com.finance.analyzer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public TransactionDTO createTransaction(TransactionDTO dto) {
        if (dto.getAmount() == null || dto.getAmount().doubleValue() <= 0) {
            throw new IllegalArgumentException("Transaction amount must be greater than zero.");
        }
        if (dto.getCategory() == null || dto.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category or source is required.");
        }

        Transaction transaction = new Transaction();
        transaction.setUserId(dto.getUserId() != null ? dto.getUserId() : 1L);
        transaction.setType(dto.getType() != null ? dto.getType() : TransactionType.EXPENSE);
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory().trim());
        transaction.setDescription(dto.getDescription());
        transaction.setTransactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDate.now());

        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    public List<TransactionDTO> getAllTransactions(Long userId, String typeStr, String category, String sortBy) {
        List<Transaction> list = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId != null ? userId : 1L);

        // Filter by Type (INCOME / EXPENSE)
        if (typeStr != null && !typeStr.trim().isEmpty() && !typeStr.equalsIgnoreCase("ALL")) {
            try {
                TransactionType type = TransactionType.valueOf(typeStr.toUpperCase());
                list = list.stream().filter(t -> t.getType() == type).collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        // Filter by Category
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) {
            list = list.stream()
                    .filter(t -> t.getCategory().equalsIgnoreCase(category.trim()))
                    .collect(Collectors.toList());
        }

        // Sort Options
        if ("amount_asc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Transaction::getAmount));
        } else if ("amount_desc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Transaction::getAmount).reversed());
        } else if ("date_asc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Transaction::getTransactionDate));
        } else {
            // Default: date_desc
            list.sort(Comparator.comparing(Transaction::getTransactionDate).reversed());
        }

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TransactionDTO> getExpenses(Long userId) {
        List<Transaction> list = transactionRepository.findByUserIdAndTypeOrderByTransactionDateDesc(
                userId != null ? userId : 1L, TransactionType.EXPENSE);
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TransactionDTO> getIncome(Long userId) {
        List<Transaction> list = transactionRepository.findByUserIdAndTypeOrderByTransactionDateDesc(
                userId != null ? userId : 1L, TransactionType.INCOME);
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    private TransactionDTO mapToDTO(Transaction entity) {
        return new TransactionDTO(
                entity.getId(),
                entity.getUserId(),
                entity.getType(),
                entity.getAmount(),
                entity.getCategory(),
                entity.getDescription(),
                entity.getTransactionDate()
        );
    }
}
