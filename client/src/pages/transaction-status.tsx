import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, ExternalLink, Home, ArrowLeft } from "lucide-react";
import { formatAddress, getExplorerUrl } from "@/lib/wallet-utils";

interface TransactionStatusProps {
  onSectionChange: (section: string) => void;
  transactionData?: any;
}

export function TransactionStatus({ onSectionChange, transactionData }: TransactionStatusProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmations, setConfirmations] = useState(3);

  // Remove mockTransaction, only use real transactionData
  if (!transactionData) {
    return (
      <section className="py-8">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-xl border-slate-200">
            <div className="gradient-primary p-6 text-white text-center">
              <h2 className="text-xl font-semibold">Transaction Status</h2>
              <p className="text-blue-100 text-sm">No transaction data available.</p>
            </div>
            <CardContent className="p-6">
              <Button onClick={() => onSectionChange("home")} className="w-full gradient-primary text-white mt-4">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const transaction = transactionData;

  useEffect(() => {
    // Simulate transaction progress
    const interval = setInterval(() => {
      setConfirmations(prev => {
        const next = prev + 1;
        if (next >= 12) {
          setCurrentStep(3);
          clearInterval(interval);
        } else if (next >= 6) {
          setCurrentStep(2);
        }
        return Math.min(next, 12);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Transaction Initiated",
      description: "2 minutes ago",
      completed: true,
    },
    {
      id: 2,
      title: "Confirming on Blockchain",
      description: `${confirmations} of 12 confirmations`,
      completed: currentStep > 2,
      inProgress: currentStep === 2,
    },
    {
      id: 3,
      title: "UPI Payment Processing",
      description: currentStep >= 3 ? "Completed" : "Pending confirmation",
      completed: currentStep >= 3,
      inProgress: currentStep === 3,
    },
  ];

  const handleViewOnExplorer = () => {
    if (!transaction.hash) return;
    let explorerUrl = `https://etherscan.io/tx/${transaction.hash}`;
    if (transaction.network && typeof transaction.network === 'string') {
      const net = transaction.network.toLowerCase();
      if (net === 'sepolia') {
        explorerUrl = `https://sepolia.etherscan.io/tx/${transaction.hash}`;
      } else if (net === 'ethereum' || net === 'mainnet') {
        explorerUrl = `https://etherscan.io/tx/${transaction.hash}`;
      }
      // Add more networks here if needed
    }
    window.open(explorerUrl, "_blank");
  };

  return (
    <section className="py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl border-slate-200">
          <div className="gradient-primary p-6 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 pulse-slow" />
            </div>
            <h2 className="text-xl font-semibold">Transaction Status</h2>
            <p className="text-blue-100 text-sm">Tracking your payment</p>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* Status Steps */}
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors ${
                    step.completed 
                      ? "bg-emerald-500" 
                      : step.inProgress 
                        ? "bg-blue-500" 
                        : "bg-slate-300"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : step.inProgress ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{step.title}</div>
                    <div className="text-xs text-slate-500">{step.description}</div>
                  </div>
                  {step.completed && (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      Complete
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Transaction Details */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium">{transaction.amount} {transaction.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">INR Value</span>
                  <span className="font-medium">₹{parseInt(transaction.inrValue).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hash</span>
                  <span className="font-mono text-xs">{formatAddress(transaction.hash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Network</span>
                  <span className="font-medium capitalize">{transaction.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <Badge variant={currentStep >= 3 ? "default" : "secondary"}>
                    {currentStep >= 3 ? "Completed" : "Processing"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleViewOnExplorer}
                className="w-full border-slate-300 hover:border-slate-400"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              
              <Button
                onClick={() => onSectionChange("home")}
                className="w-full gradient-primary hover:opacity-90 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
