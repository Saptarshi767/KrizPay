import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertPaymentIntentSchema, insertCryptoPriceSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                           await storage.getUserByWalletAddress(userData.walletAddress);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Check if transaction already exists
      const existingTransaction = await storage.getTransactionByHash(transactionData.hash);
      if (existingTransaction) {
        return res.status(400).json({ message: "Transaction already exists" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid transaction data", error: error.message });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (userId) {
        const transactions = await storage.getTransactionsByUserId(parseInt(userId as string));
        res.json(transactions);
      } else {
        const transactions = await storage.getAllTransactions();
        res.json(transactions);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/:hash", async (req, res) => {
    try {
      const transaction = await storage.getTransactionByHash(req.params.hash);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const transaction = await storage.updateTransactionStatus(parseInt(req.params.id), status);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment Intent routes
  app.post("/api/payment-intents", async (req, res) => {
    try {
      const paymentIntentData = {
        ...req.body,
        id: nanoid(10),
      };
      
      const validatedData = insertPaymentIntentSchema.parse(paymentIntentData);
      const paymentIntent = await storage.createPaymentIntent(validatedData);
      
      // Generate UPI QR code data
      const qrCodeData = `upi://pay?pa=${paymentIntent.upiVpa}&pn=KrizPay&am=${paymentIntent.inrAmount}&cu=INR&tr=${paymentIntent.id}`;
      
      res.json({ ...paymentIntent, qrCodeData });
    } catch (error: any) {
      res.status(400).json({ message: "Invalid payment intent data", error: error.message });
    }
  });

  app.get("/api/payment-intents/:id", async (req, res) => {
    try {
      const paymentIntent = await storage.getPaymentIntent(req.params.id);
      if (!paymentIntent) {
        return res.status(404).json({ message: "Payment intent not found" });
      }
      res.json(paymentIntent);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/payment-intents/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const paymentIntent = await storage.updatePaymentIntentStatus(req.params.id, status);
      
      if (!paymentIntent) {
        return res.status(404).json({ message: "Payment intent not found" });
      }
      
      res.json(paymentIntent);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Crypto Price routes
  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage.getAllCryptoPrices();
      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/prices/:token", async (req, res) => {
    try {
      const price = await storage.getCryptoPrice(req.params.token.toLowerCase());
      if (!price) {
        return res.status(404).json({ message: "Price not found" });
      }
      res.json(price);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/prices/update", async (req, res) => {
    try {
      const priceData = insertCryptoPriceSchema.parse(req.body);
      const price = await storage.updateCryptoPrice(priceData);
      res.json(price);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid price data", error: error.message });
    }
  });

  // Admin stats route
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      const users = await storage.getAllTransactions();
      
      const totalVolume = transactions.reduce((sum, tx) => {
        return sum + (tx.inrValue ? parseFloat(tx.inrValue) : 0);
      }, 0);
      
      const successfulTransactions = transactions.filter(tx => tx.status === "confirmed");
      const successRate = transactions.length > 0 ? (successfulTransactions.length / transactions.length) * 100 : 0;
      
      const stats = {
        totalVolume: totalVolume.toFixed(2),
        transactions: transactions.length,
        successRate: successRate.toFixed(1),
        activeUsers: users.length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Fetch live crypto prices from CoinGecko
  app.post("/api/prices/fetch", async (req, res) => {
    try {
      const tokens = ['ethereum', 'matic-network', 'binancecoin', 'flow'];
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokens.join(',')}&vs_currencies=inr`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      
      // Map CoinGecko IDs to our token symbols
      const tokenMap = {
        'ethereum': 'eth',
        'matic-network': 'matic',
        'binancecoin': 'bnb',
        'flow': 'flow'
      };
      
      const updatedPrices = [];
      
      for (const [coinGeckoId, priceData] of Object.entries(data)) {
        const token = tokenMap[coinGeckoId as keyof typeof tokenMap];
        if (token && (priceData as any).inr) {
          const price = await storage.updateCryptoPrice({
            token,
            priceInr: (priceData as any).inr.toString()
          });
          updatedPrices.push(price);
        }
      }
      
      res.json(updatedPrices);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch prices", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
