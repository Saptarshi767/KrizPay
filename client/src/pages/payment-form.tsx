import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TOKEN_CONFIGS } from "@/lib/wallet-utils";
import { Send, ArrowLeft, RefreshCw, Wallet } from "lucide-react";
import { ethers } from "ethers";

interface PaymentFormProps {
  onSectionChange: (section: string) => void;
  recipientData?: any;
}

export function PaymentForm({ onSectionChange, recipientData }: PaymentFormProps) {
  const { state: walletState } = useWallet();
  const { convertToINR, getPriceInINR } = useCryptoPrices();
  const queryClient = useQueryClient();
  
  const [selectedToken, setSelectedToken] = useState("eth");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(recipientData?.data?.address || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (recipientData?.data?.address) {
      setRecipient(recipientData.data.address);
    }
  }, [recipientData]);

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest("POST", "/api/transactions", transactionData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onSectionChange("transaction-status");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSendTransaction = async () => {
    if (!walletState.isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!recipient) {
      setError("Please enter a recipient address");
      return;
    }

    if (!walletState.signer) {
      setError("Wallet signer not available");
      return;
    }

    setError("");

    try {
      const amountInWei = ethers.parseEther(amount);
      const inrValue = convertToINR(parseFloat(amount), selectedToken);

      // Create transaction on blockchain
      const tx = await walletState.signer.sendTransaction({
        to: recipient,
        value: amountInWei,
      });

      // Save transaction to backend
      await createTransactionMutation.mutateAsync({
        hash: tx.hash,
        fromAddress: walletState.address,
        toAddress: recipient,
        amount: amount,
        token: selectedToken,
        network: walletState.network || "ethereum",
        inrValue: inrValue.toString(),
      });

    } catch (error) {
      setError(error.message || "Transaction failed");
    }
  };

  const tokenOptions = Object.entries(TOKEN_CONFIGS).map(([key, config]) => ({
    id: key,
    ...config,
  }));

  const inrValue = amount ? convertToINR(parseFloat(amount), selectedToken) : 0;
  const currentPrice = getPriceInINR(selectedToken);

  return (
    <section className="py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl border-slate-200">
          <div className="gradient-purple p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Send Payment</h2>
                <p className="text-purple-100 text-sm">Choose amount and token</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-purple-200">Balance</div>
                <div className="font-semibold">
                  {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ETH` : "0.00"}
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {!walletState.isConnected && (
              <Alert>
                <Wallet className="w-4 h-4" />
                <AlertDescription>
                  Please connect your wallet to continue
                </AlertDescription>
              </Alert>
            )}

            {/* Token Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">Select Token</Label>
              <div className="grid grid-cols-2 gap-3">
                {tokenOptions.slice(0, 2).map((token) => (
                  <Button
                    key={token.id}
                    variant={selectedToken === token.id ? "default" : "outline"}
                    onClick={() => setSelectedToken(token.id)}
                    className={`flex items-center p-3 h-auto transition-colors ${
                      selectedToken === token.id 
                        ? "bg-blue-500 text-white border-blue-500" 
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <div className={`w-8 h-8 ${token.color} rounded-full flex items-center justify-center mr-3`}>
                      <i className={`${token.icon} text-white text-sm`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs opacity-75">{token.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-slate-700 mb-2 block">
                Amount
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-medium pr-16"
                  step="0.0001"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {TOKEN_CONFIGS[selectedToken]?.symbol}
                </div>
              </div>
            </div>

            {/* Conversion Display */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">≈ INR Value</span>
                <span className="text-lg font-semibold text-slate-800">
                  ₹{inrValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate-500">
                  Rate: 1 {TOKEN_CONFIGS[selectedToken]?.symbol} = ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-emerald-600">
                  <RefreshCw className="w-3 h-3 mr-1 inline" />
                  Live
                </span>
              </div>
            </div>

            {/* Recipient Display */}
            <div>
              <Label htmlFor="recipient" className="text-sm font-medium text-slate-700 mb-2 block">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                placeholder="0x742d35Cc6648..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSendTransaction}
                disabled={!walletState.isConnected || createTransactionMutation.isPending || !amount || !recipient}
                className="w-full gradient-primary hover:opacity-90 text-white"
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Payment
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => onSectionChange("home")}
                className="w-full text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
