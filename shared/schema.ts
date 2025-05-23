import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "income", "expense", "business", "loan"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // "income", "expense", "business", "loan"
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("active"), // "active", "paid", "overdue"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  subscriptionStatus: text("subscription_status").notNull().default("free"), // "free", "premium"
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  plaidAccessToken: text("plaid_access_token"),
  plaidItemId: text("plaid_item_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: text("account_id").notNull(), // From Plaid
  institutionName: text("institution_name").notNull(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // checking, savings, credit, etc.
  accountSubtype: text("account_subtype"),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }),
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }),
  isoPrimaryCurrency: text("iso_primary_currency").default("USD"),
  lastSynced: timestamp("last_synced").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id).notNull(),
  transactionId: text("transaction_id").notNull(), // From Plaid
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  isoCurrencyCode: text("iso_currency_code").default("USD"),
  date: date("date").notNull(),
  authorizedDate: date("authorized_date"),
  name: text("name").notNull(),
  merchantName: text("merchant_name"),
  categoryId: text("category_id"),
  category: text("category").array(),
  accountOwner: text("account_owner"),
  pending: boolean("pending").default(false),
  transactionType: text("transaction_type"), // digital, place, special, unresolved
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;
