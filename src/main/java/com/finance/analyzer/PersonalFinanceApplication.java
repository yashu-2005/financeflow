package com.finance.analyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Entry Point for the Personal Finance & Expense Analyzer Application.
 * 
 * @SpringBootApplication enables:
 * 1. @Configuration - Allows registering extra beans or context configs.
 * 2. @EnableAutoConfiguration - Enables Spring Boot's auto-configuration mechanisms.
 * 3. @ComponentScan - Enables component scanning on the package 'com.finance.analyzer'
 *    to automatically find Controllers, Services, and Repositories.
 */
@SpringBootApplication
public class PersonalFinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PersonalFinanceApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" Personal Finance & Expense Analyzer started successfully!");
        System.out.println(" Access Application: http://localhost:8080");
        System.out.println("==========================================================");
    }
}
