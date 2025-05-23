import { 
  transactions, 
  categories, 
  loans, 
  users,
  type Transaction, 
  type InsertTransaction,
  type Category,
  type InsertCategory,
  type Loan,
  type InsertLoan,
  type User, 
  type InsertUser 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private categories: Map<number, Category>;
  private loans: Map<number, Loan>;
  private currentUserId: number;
  private currentTransactionId: number;
  private currentCategoryId: number;
  private currentLoanId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.categories = new Map();
    this.loans = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentCategoryId = 1;
    this.currentLoanId = 1;

    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    const defaultCategories = [
      // Income categories
      { name: "Salary", type: "income", color: "#059669", icon: "dollar-sign" },
      { name: "Freelance", type: "income", color: "#0891b2", icon: "briefcase" },
      { name: "Investment", type: "income", color: "#7c3aed", icon: "trending-up" },
      { name: "Other Income", type: "income", color: "#059669", icon: "plus-circle" },

      // Expense categories
      { name: "Food & Dining", type: "expense", color: "#dc2626", icon: "utensils" },
      { name: "Transportation", type: "expense", color: "#ea580c", icon: "car" },
      { name: "Shopping", type: "expense", color: "#d97706", icon: "shopping-bag" },
      { name: "Utilities", type: "expense", color: "#dc2626", icon: "zap" },
      { name: "Entertainment", type: "expense", color: "#7c2d12", icon: "film" },
      { name: "Healthcare", type: "expense", color: "#be123c", icon: "heart" },
      { name: "Education", type: "expense", color: "#9333ea", icon: "book" },
      { name: "Other Expenses", type: "expense", color: "#dc2626", icon: "minus-circle" },

      // Business categories
      { name: "Office Supplies", type: "business", color: "#2563eb", icon: "clipboard" },
      { name: "Marketing", type: "business", color: "#7c3aed", icon: "megaphone" },
      { name: "Travel", type: "business", color: "#0891b2", icon: "plane" },
      { name: "Equipment", type: "business", color: "#059669", icon: "monitor" },

      // Loan categories
      { name: "Loan Payment", type: "loan", color: "#d97706", icon: "handshake" },
      { name: "Interest", type: "loan", color: "#dc2626", icon: "percent" },
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoriesByType(type: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(category => category.type === type);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Loan methods
  async getLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.currentLoanId++;
    const loan: Loan = { 
      ...insertLoan, 
      id,
      status: insertLoan.status || "active",
      createdAt: new Date()
    };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: number, updates: Partial<InsertLoan>): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;

    const updatedLoan = { ...loan, ...updates };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  async deleteLoan(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }

  // Analytics methods
  async getTotalIncome(startDate?: Date, endDate?: Date): Promise<number> {
    let transactions = Array.from(this.transactions.values()).filter(t => t.type === "income");
    
    if (startDate && endDate) {
      transactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }

  async getTotalExpenses(startDate?: Date, endDate?: Date): Promise<number> {
    let transactions = Array.from(this.transactions.values()).filter(t => 
      t.type === "expense" || t.type === "business" || t.type === "loan"
    );
    
    if (startDate && endDate) {
      transactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }

  async getNetBalance(startDate?: Date, endDate?: Date): Promise<number> {
    const income = await this.getTotalIncome(startDate, endDate);
    const expenses = await this.getTotalExpenses(startDate, endDate);
    return income - expenses;
  }

  async getTotalLoanBalance(): Promise<number> {
    return Array.from(this.loans.values())
      .filter(loan => loan.status === "active")
      .reduce((sum, loan) => sum + parseFloat(loan.remainingAmount), 0);
  }

  async getCategoryBreakdown(type: string, startDate?: Date, endDate?: Date): Promise<Array<{category: string, amount: number}>> {
    let transactions = Array.from(this.transactions.values()).filter(t => t.type === type);
    
    if (startDate && endDate) {
      transactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    const breakdown = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }
}

export const storage = new MemStorage();
