import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "@/contexts/wallet-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/layout/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Home } from "@/pages/home";
import { WalletConnect } from "@/pages/wallet-connect";
import { QRScanner } from "@/pages/qr-scanner";
import { PaymentForm } from "@/pages/payment-form";
import { UPIPayment } from "@/pages/upi-payment";
import { TransactionStatus } from "@/pages/transaction-status";
import { UserAuth } from "@/pages/user-auth";
import { AdminDashboard } from "@/pages/admin-dashboard";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-slate-50">
              <Navigation />
              <main className="pt-16 pb-20 lg:pb-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wallet-connect" element={<WalletConnect />} />
                  <Route path="/qr-scanner" element={<QRScanner />} />
                  <Route path="/payment-form" element={<PaymentForm />} />
                  <Route path="/upi-payment" element={<UPIPayment />} />
                  <Route path="/transaction-status" element={<TransactionStatus />} />
                  <Route path="/user-auth" element={<UserAuth />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <MobileNav />
            </div>
          </Router>
          <Toaster />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
