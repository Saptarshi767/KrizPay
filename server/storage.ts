import { 
  users, 
  transactions, 
  paymentIntents, 
  cryptoPrices,
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type PaymentIntent,
  type InsertPaymentIntent,
  type CryptoPrice,
  type InsertCryptoPrice
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByHash(hash: string): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  
  // Payment Intents
  getPaymentIntent(id: string): Promise<PaymentIntent | undefined>;
  getPaymentIntentsByUserId(userId: number): Promise<PaymentIntent[]>;
  createPaymentIntent(paymentIntent: InsertPaymentIntent): Promise<PaymentIntent>;
  updatePaymentIntentStatus(id: string, status: string): Promise<PaymentIntent | undefined>;
  
  // Crypto Prices
  getCryptoPrice(token: string): Promise<CryptoPrice | undefined>;
  getAllCryptoPrices(): Promise<CryptoPrice[]>;
  updateCryptoPrice(price: InsertCryptoPrice): Promise<CryptoPrice>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private paymentIntents: Map<string, PaymentIntent> = new Map();
  private cryptoPrices: Map<string, CryptoPrice> = new Map();
  private currentUserId = 1;
  private currentTransactionId = 1;
  private currentPriceId = 1;

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(tx => tx.hash === hash);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.userId === userId);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...insertTransaction,
      id: this.currentTransactionId++,
      status: insertTransaction.status || "pending",
      userId: insertTransaction.userId || null,
      inrValue: insertTransaction.inrValue || null,
      upiVpa: insertTransaction.upiVpa || null,
      paymentIntentId: insertTransaction.paymentIntentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.status = status;
      transaction.updatedAt = new Date();
      this.transactions.set(id, transaction);
      return transaction;
    }
    return undefined;
  }

  // Payment Intents
  async getPaymentIntent(id: string): Promise<PaymentIntent | undefined> {
    return this.paymentIntents.get(id);
  }

  async getPaymentIntentsByUserId(userId: number): Promise<PaymentIntent[]> {
    return Array.from(this.paymentIntents.values()).filter(pi => pi.userId === userId);
  }

  async createPaymentIntent(insertPaymentIntent: InsertPaymentIntent): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      ...insertPaymentIntent,
      status: insertPaymentIntent.status || "pending",
      userId: insertPaymentIntent.userId || null,
      qrCodeData: insertPaymentIntent.qrCodeData || null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
    this.paymentIntents.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  }

  async updatePaymentIntentStatus(id: string, status: string): Promise<PaymentIntent | undefined> {
    const paymentIntent = this.paymentIntents.get(id);
    if (paymentIntent) {
      paymentIntent.status = status;
      this.paymentIntents.set(id, paymentIntent);
      return paymentIntent;
    }
    return undefined;
  }

  // Crypto Prices
  async getCryptoPrice(token: string): Promise<CryptoPrice | undefined> {
    return this.cryptoPrices.get(token);
  }

  async getAllCryptoPrices(): Promise<CryptoPrice[]> {
    return Array.from(this.cryptoPrices.values());
  }

  async updateCryptoPrice(insertPrice: InsertCryptoPrice): Promise<CryptoPrice> {
    const existingPrice = this.cryptoPrices.get(insertPrice.token);
    const price: CryptoPrice = {
      ...insertPrice,
      id: existingPrice?.id || this.currentPriceId++,
      lastUpdated: new Date(),
    };
    this.cryptoPrices.set(price.token, price);
    return price;
  }
}

export const storage = new MemStorage();
