import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { useWeb3Transactions } from "@/hooks/use-web3-transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TransactionButton } from "@/components/wallet/transaction-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TOKEN_CONFIGS, isValidAddress, formatBalance } from "@/lib/wallet-utils";
import { Send, ArrowLeft, RefreshCw, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import { generateMetaMaskQR } from "@/lib/qr-utils";
import QRCode from "react-qr-code";
import { QRScanner } from "./qr-scanner";

interface PaymentFormProps {
  onSectionChange: (section: string, data?: any) => void;
  recipientData?: any;
}

export function PaymentForm({ onSectionChange, recipientData }: PaymentFormProps) {
  const { state: walletState } = useWallet();
  const { convertToINR, getPriceInINR } = useCryptoPrices();
  const { transactionState, estimateGas } = useWeb3Transactions();
  const queryClient = useQueryClient();
  
  const [selectedToken, setSelectedToken] = useState<keyof typeof TOKEN_CONFIGS>("eth");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(recipientData?.data?.address || "");
  const [error, setError] = useState<string>("");
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const [isValidRecipient, setIsValidRecipient] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [scannedFromQR, setScannedFromQR] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    // Strip any '@...' suffix from the address before validation
    let cleanAddress = recipientData?.data?.address;
    if (typeof cleanAddress === 'string' && cleanAddress.includes('@')) {
      cleanAddress = cleanAddress.slice(0, cleanAddress.indexOf('@'));
    }
    // Only set recipient if address is present, is 42 chars, and is a valid EIP-55 address
    if (cleanAddress &&
        cleanAddress.length === 42 &&
        isValidAddress(cleanAddress) &&
        ethers.getAddress(cleanAddress) === cleanAddress) {
      setRecipient(cleanAddress);
      setScannedFromQR(true);
    } else if (recipientData?.data?.address) {
      setError("Scanned address is not a valid EIP-55 checksummed Ethereum address.");
    }
    if (recipientData?.data?.amount) {
      setAmount(recipientData.data.amount);
      setScannedFromQR(true);
    }
    if (recipientData?.data?.token) {
      setSelectedToken(recipientData.data.token as keyof typeof TOKEN_CONFIGS);
      setScannedFromQR(true);
    }
  }, [recipientData]);

  useEffect(() => {
    setIsValidRecipient(isValidAddress(recipient));
  }, [recipient]);

  useEffect(() => {
    const estimateTransactionGas = async () => {
      if (walletState.isConnected && amount && isValidRecipient && parseFloat(amount) > 0) {
        try {
          const gas = await estimateGas({
            to: recipient,
            value: amount,
          });
          setGasEstimate(ethers.formatEther(gas * BigInt(20_000_000_000))); // Assuming 20 gwei gas price
        } catch (error) {
          setGasEstimate("");
        }
      } else {
        setGasEstimate("");
      }
    };

    const timeoutId = setTimeout(estimateTransactionGas, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, recipient, isValidRecipient, walletState.isConnected, estimateGas]);

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest("POST", "/api/transactions", transactionData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onSectionChange("transaction-status");
    },
    onError: (error: unknown) => {
      if (typeof error === "object" && error && "message" in error) {
        setError((error as { message: string }).message);
      } else {
        setError("An unknown error occurred");
      }
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
      const transactionRecord = await createTransactionMutation.mutateAsync({
        hash: tx.hash,
        fromAddress: walletState.address,
        toAddress: recipient,
        amount: amount,
        token: selectedToken,
        network: walletState.network || "ethereum",
        inrValue: inrValue.toString(),
      });

      // Pass real transaction data to status page
      onSectionChange("transaction-status", { transactionData: {
        hash: tx.hash,
        amount,
        token: selectedToken,
        inrValue: inrValue.toString(),
        network: walletState.network || "ethereum",
        status: "pending",
        from: walletState.address,
        to: recipient,
        timestamp: new Date().toISOString(),
      }});
    } catch (error: any) {
      setError(error.message || "Transaction failed");
    }
  };

  const tokenOptions = Object.entries(TOKEN_CONFIGS).map(([key, config]) => ({
    id: key,
    ...config,
  }));

  // Type guard for TOKEN_CONFIGS access
  function getTokenConfig(token: string) {
    return TOKEN_CONFIGS[token as keyof typeof TOKEN_CONFIGS] || TOKEN_CONFIGS["eth"];
  }

  const inrValue = amount ? convertToINR(parseFloat(amount), selectedToken) : 0;
  const currentPrice = getPriceInINR(selectedToken);
  // Update QR string logic for MetaMask compatibility
  const qrString = recipient && amount
    ? generateMetaMaskQR(recipient, amount)
    : recipient
      ? recipient
      : "";

  // Handler for QR scan result
  const handleQRProcessed = (parsed: any) => {
    if (parsed.type === "address" && parsed.data?.address) {
      setRecipient(parsed.data.address);
      if (parsed.data.amount) setAmount(parsed.data.amount);
      if (parsed.data.token) setSelectedToken(parsed.data.token as keyof typeof TOKEN_CONFIGS);
      setScannedFromQR(true);
    }
    setShowQRScanner(false);
  };

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
            <Button
              type="button"
              className="w-full bg-blue-100 text-blue-800 border border-blue-300 mb-2"
              onClick={() => setShowQRScanner(true)}
            >
              Scan Ethereum Address QR
            </Button>
            {showQRScanner && (
              <div className="mb-4">
                <QRScanner
                  onSectionChange={() => setShowQRScanner(false)}
                  onQRProcessed={handleQRProcessed}
                />
              </div>
            )}
            {scannedFromQR && (
              <Badge className="mb-2 bg-emerald-100 text-emerald-800 border-emerald-300">
                Scanned from QR: You are sending {amount || "-"} {getTokenConfig(selectedToken).symbol || "ETH"} (≈ ₹{inrValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}) to {recipient?.slice(0, 8)}...{recipient?.slice(-4)}
              </Badge>
            )}
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
                    onClick={() => setSelectedToken(token.id as keyof typeof TOKEN_CONFIGS)}
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
                  {getTokenConfig(selectedToken).symbol}
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
                  Rate: 1 {getTokenConfig(selectedToken).symbol} = ₹{currentPrice.toLocaleString('en-IN')}
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
                onChange={(e) => {
                  let val = e.target.value;
                  if (typeof val === 'string' && val.includes('@')) {
                    val = val.slice(0, val.indexOf('@'));
                  }
                  setRecipient(val);
                  setError(""); // Optionally clear error on change
                }}
                className={`font-mono text-sm ${
                  recipient && !isValidRecipient ? "border-red-300" : 
                  recipient && isValidRecipient ? "border-emerald-300" : ""
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {recipientData && (
                  <div className="text-sm text-emerald-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Scanned from QR code
                  </div>
                )}
                {recipient && !isValidRecipient && (
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Invalid address format
                  </div>
                )}
                {recipient && isValidRecipient && !recipientData && (
                  <div className="text-sm text-emerald-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid address
                  </div>
                )}
              </div>
            </div>

            {/* Gas Estimate */}
            {gasEstimate && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Estimated Gas Fee</div>
                <div className="text-sm font-medium text-slate-800">
                  ~{formatBalance(gasEstimate, 6)} ETH
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {walletState.isConnected && amount && recipient && isValidRecipient ? (
                <TransactionButton
                  to={recipient}
                  amount={amount}
                  label="Send Payment"
                  onSuccess={(hash) => {
                    // Create transaction record in database
                    createTransactionMutation.mutate({
                      hash,
                      fromAddress: walletState.address,
                      toAddress: recipient,
                      amount: amount,
                      token: selectedToken,
                      network: walletState.network || "ethereum",
                      inrValue: inrValue.toString(),
                    });
                    onSectionChange("transaction-status", { transactionData: {
                      hash,
                      amount,
                      token: selectedToken,
                      inrValue: inrValue.toString(),
                      network: walletState.network || "ethereum",
                      status: "pending",
                      from: walletState.address,
                      to: recipient,
                      timestamp: new Date().toISOString(),
                    }});
                  }}
                  onError={(error) => setError(error)}
                  className="gradient-primary"
                />
              ) : (
                <Button
                  disabled
                  className="w-full gradient-primary text-white opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {!walletState.isConnected ? "Connect Wallet" : 
                   !amount ? "Enter Amount" :
                   !recipient ? "Enter Recipient" :
                   !isValidRecipient ? "Invalid Address" : "Send Payment"}
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={() => onSectionChange("home")}
                className="w-full text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <Button
              type="button"
              className="w-full gradient-emerald text-white"
              onClick={() => setShowQR(true)}
              disabled={!recipient || !amount}
            >
              Generate MetaMask QR
            </Button>
            {showQR && qrString && (
              <div className="flex flex-col items-center mt-4">
                <QRCode value={qrString} size={180} />
                <div className="text-xs mt-2 break-all text-center">{qrString}</div>
                <Button variant="ghost" className="mt-2" onClick={() => setShowQR(false)}>
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
