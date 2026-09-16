package com.expensetracker.model;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

public class Expense {
    private int expenseId;
    private int userId;
    private String title;
    private String categoryName;
    private BigDecimal amount;
    private Date expenseDate;
    private String notes;
    private Timestamp createdAt;

    public Expense() {}

    public Expense(int expenseId, int userId, String title, String categoryName, BigDecimal amount, Date expenseDate, String notes, Timestamp createdAt) {
        this.expenseId = expenseId;
        this.userId = userId;
        this.title = title;
        this.categoryName = categoryName;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public Expense(int userId, String title, String categoryName, BigDecimal amount, Date expenseDate, String notes) {
        this.userId = userId;
        this.title = title;
        this.categoryName = categoryName;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
    }

    public int getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(int expenseId) {
        this.expenseId = expenseId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Date getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(Date expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
