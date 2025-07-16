import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  hash: text("hash").notNull().unique(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  token: text("token").notNull(), // ETH, MATIC, BNB, etc.
  network: text("network").notNull(), // ethereum, polygon, bsc, flow
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  inrValue: decimal("inr_value", { precision: 15, scale: 2 }),
  upiVpa: text("upi_vpa"),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentIntents = pgTable("payment_intents", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  upiVpa: text("upi_vpa").notNull(),
  cryptoAmount: decimal("crypto_amount", { precision: 20, scale: 8 }).notNull(),
  token: text("token").notNull(),
  inrAmount: decimal("inr_amount", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  qrCodeData: text("qr_code_data"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const cryptoPrices = pgTable("crypto_prices", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  priceInr: decimal("price_inr", { precision: 15, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentIntentSchema = createInsertSchema(paymentIntents).omit({
  createdAt: true,
  expiresAt: true,
});

export const insertCryptoPriceSchema = createInsertSchema(cryptoPrices).omit({
  id: true,
  lastUpdated: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type InsertPaymentIntent = z.infer<typeof insertPaymentIntentSchema>;
export type CryptoPrice = typeof cryptoPrices.$inferSelect;
export type InsertCryptoPrice = z.infer<typeof insertCryptoPriceSchema>;
