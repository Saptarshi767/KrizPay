import { useState } from "react";
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
  const [currentSection, setCurrentSection] = useState("home");
  const [qrData, setQrData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);

  const handleSectionChange = (section: string, data?: any) => {
    setCurrentSection(section);
    if (section === "transaction-status" && data && data.transactionData) {
      setTransactionData(data.transactionData);
    }
  };

  const handleQRProcessed = (data: any) => {
    setQrData(data);
  };

  const handleTransactionData = (data: any) => {
    setTransactionData(data);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "home":
        return <Home onSectionChange={handleSectionChange} />;
      case "wallet-connect":
        return <WalletConnect onSectionChange={handleSectionChange} />;
      case "qr-scanner":
        return <QRScanner onSectionChange={handleSectionChange} onQRProcessed={handleQRProcessed} />;
      case "payment-form":
        return <PaymentForm onSectionChange={handleSectionChange} recipientData={qrData} />;
      case "upi-payment":
        return <UPIPayment onSectionChange={handleSectionChange} upiData={qrData} />;
      case "transaction-status":
        return <TransactionStatus onSectionChange={handleSectionChange} transactionData={transactionData} />;
      case "user-auth":
        return <UserAuth onSectionChange={handleSectionChange} />;
      case "admin-dashboard":
        return <AdminDashboard onSectionChange={handleSectionChange} />;
      default:
        return <Home onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-slate-50">
            <Navigation onAdminClick={() => handleSectionChange("admin-dashboard")} />
            <main className="pt-16 pb-20 lg:pb-0">
              {renderCurrentSection()}
            </main>
            <MobileNav currentSection={currentSection} onSectionChange={handleSectionChange} />
          </div>
          <Toaster />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
