import { users, transactions, categories, loans, type User, type InsertUser, type Transaction, type InsertTransaction, type Category, type InsertCategory, type Loan, type InsertLoan } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoriesByType(type: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Loan methods
  getLoans(): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, updates: Partial<InsertLoan>): Promise<Loan | undefined>;
  deleteLoan(id: number): Promise<boolean>;

  // Analytics methods
  getTotalIncome(startDate?: Date, endDate?: Date): Promise<number>;
  getTotalExpenses(startDate?: Date, endDate?: Date): Promise<number>;
  getNetBalance(startDate?: Date, endDate?: Date): Promise<number>;
  getTotalLoanBalance(): Promise<number>;
  getCategoryBreakdown(type: string, startDate?: Date, endDate?: Date): Promise<Array<{category: string, amount: number}>>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    try {
      // Check if categories already exist
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length > 0) return;

      // Income categories
      const incomeCategories = [
        { name: "Salary", type: "income", color: "#10B981", icon: "💼" },
        { name: "Freelance", type: "income", color: "#3B82F6", icon: "💻" },
        { name: "Investment", type: "income", color: "#8B5CF6", icon: "📈" },
        { name: "Other Income", type: "income", color: "#06B6D4", icon: "💰" },
      ];

      // Expense categories
      const expenseCategories = [
        { name: "Food", type: "expense", color: "#EF4444", icon: "🍔" },
        { name: "Transportation", type: "expense", color: "#F59E0B", icon: "🚗" },
        { name: "Utilities", type: "expense", color: "#84CC16", icon: "⚡" },
        { name: "Entertainment", type: "expense", color: "#EC4899", icon: "🎬" },
        { name: "Healthcare", type: "expense", color: "#14B8A6", icon: "🏥" },
        { name: "Shopping", type: "expense", color: "#F97316", icon: "🛍️" },
        { name: "Other Expense", type: "expense", color: "#6B7280", icon: "💳" },
      ];

      // Business categories
      const businessCategories = [
        { name: "Office Supplies", type: "business", color: "#3B82F6", icon: "📝" },
        { name: "Marketing", type: "business", color: "#10B981", icon: "📢" },
        { name: "Travel", type: "business", color: "#F59E0B", icon: "✈️" },
        { name: "Equipment", type: "business", color: "#8B5CF6", icon: "💻" },
      ];

      const allCategories = [...incomeCategories, ...expenseCategories, ...businessCategories];
      
      await db.insert(categories).values(allCategories);
    } catch (error) {
      console.log('Categories already initialized or error occurred:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(sql`${transactions.date} DESC`);
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.type, type)).orderBy(sql`${transactions.date} DESC`);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.select().from(transactions).where(
      and(
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    ).orderBy(sql`${transactions.date} DESC`);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updated] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount > 0;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoriesByType(type: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.type, type));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  async getLoans(): Promise<Loan[]> {
    return await db.select().from(loans).orderBy(sql`${loans.createdAt} DESC`);
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan || undefined;
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const [newLoan] = await db
      .insert(loans)
      .values(loan)
      .returning();
    return newLoan;
  }

  async updateLoan(id: number, updates: Partial<InsertLoan>): Promise<Loan | undefined> {
    const [updated] = await db
      .update(loans)
      .set(updates)
      .where(eq(loans.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLoan(id: number): Promise<boolean> {
    const result = await db.delete(loans).where(eq(loans.id, id));
    return result.rowCount > 0;
  }

  async getTotalIncome(startDate?: Date, endDate?: Date): Promise<number> {
    let query = db.select({ sum: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.type, "income"));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(transactions.type, "income"),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );
    }

    const [result] = await query;
    return parseFloat(result.sum || "0");
  }

  async getTotalExpenses(startDate?: Date, endDate?: Date): Promise<number> {
    let query = db.select({ sum: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.type, "expense"));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(transactions.type, "expense"),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );
    }

    const [result] = await query;
    return parseFloat(result.sum || "0");
  }

  async getNetBalance(startDate?: Date, endDate?: Date): Promise<number> {
    const totalIncome = await this.getTotalIncome(startDate, endDate);
    const totalExpenses = await this.getTotalExpenses(startDate, endDate);
    return totalIncome - totalExpenses;
  }

  async getTotalLoanBalance(): Promise<number> {
    const [result] = await db.select({ 
      sum: sql<string>`COALESCE(SUM(${loans.remainingAmount}), 0)` 
    }).from(loans).where(eq(loans.status, "active"));
    
    return parseFloat(result.sum || "0");
  }

  async getCategoryBreakdown(type: string, startDate?: Date, endDate?: Date): Promise<Array<{category: string, amount: number}>> {
    let query = db.select({
      category: transactions.category,
      amount: sql<string>`SUM(${transactions.amount})`
    })
    .from(transactions)
    .where(eq(transactions.type, type))
    .groupBy(transactions.category);

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(transactions.type, type),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );
    }

    const results = await query;
    return results.map(r => ({
      category: r.category,
      amount: parseFloat(r.amount || "0")
    }));
  }
}

export const storage = new DatabaseStorage();