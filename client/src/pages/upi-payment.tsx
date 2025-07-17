import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TOKEN_CONFIGS } from "@/lib/wallet-utils";
import { Smartphone, CreditCard, QrCode, Info, ArrowLeft } from "lucide-react";
import QRCode from "react-qr-code";
import QrReader from 'react-qr-reader';

type PaymentIntent = {
  id: string;
  upiVpa: string;
  inrAmount: string;
  qrCodeData: string;
  // add other properties as needed
};

interface UPIPaymentProps {
  onSectionChange: (section: string) => void;
  upiData?: any;
}

export function UPIPayment({ onSectionChange, upiData }: UPIPaymentProps) {
  const { state: walletState } = useWallet();
  const { convertToINR, getPriceInINR } = useCryptoPrices();
  
  const [selectedToken, setSelectedToken] = useState("eth");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [upiVpa, setUpiVpa] = useState(upiData?.data?.vpa || "");
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string | null>(null);

  useEffect(() => {
    if (upiData?.data?.vpa) {
      setUpiVpa(upiData.data.vpa);
    }
  }, [upiData]);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (intentData: any) => {
      const response = await apiRequest("POST", "/api/payment-intents", intentData);
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentIntent(data);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleCreatePaymentIntent = async () => {
    if (!walletState.isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      setError("Please enter a valid crypto amount");
      return;
    }

    if (!upiVpa) {
      setError("UPI VPA is required");
      return;
    }

    setError("");

    try {
      const inrAmount = convertToINR(parseFloat(cryptoAmount), selectedToken);
      
      await createPaymentIntentMutation.mutateAsync({
        userId: 1, // This would come from user context in real app
        upiVpa,
        cryptoAmount,
        token: selectedToken,
        inrAmount: inrAmount.toFixed(2),
      });
    } catch (error) {
      setError(error.message || "Failed to create payment intent");
    }
  };

  const tokenOptions = Object.entries(TOKEN_CONFIGS).map(([key, config]) => ({
    id: key,
    ...config,
  }));

  const inrAmount = cryptoAmount ? convertToINR(parseFloat(cryptoAmount), selectedToken) : 0;
  const currentPrice = getPriceInINR(selectedToken);

  return (
    <section className="py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl border-slate-200">
          <div className="gradient-emerald p-6 text-white text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Pay via UPI</h2>
            <p className="text-emerald-100 text-sm">Crypto to INR conversion</p>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* UPI Details */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="text-sm text-emerald-700 mb-2">UPI ID Detected:</div>
              <div className="font-semibold text-emerald-800">{upiVpa}</div>
            </div>

            {/* Amount Section */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Enter Crypto Amount
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                    className="text-lg font-medium"
                    step="0.0001"
                  />
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenOptions.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Real-time conversion */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">INR Amount</span>
                    <span className="text-xl font-bold text-slate-800">
                      ₹{inrAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Rate: 1 {TOKEN_CONFIGS[selectedToken]?.symbol} = ₹{currentPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Flow */}
            <div className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  You'll send crypto first, then UPI payment will be initiated
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!paymentIntent ? (
                <Button
                  onClick={handleCreatePaymentIntent}
                  disabled={createPaymentIntentMutation.isPending || !cryptoAmount || !upiVpa}
                  className="w-full gradient-emerald hover:opacity-90 text-white"
                >
                  {createPaymentIntentMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Create Payment Intent
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-700 mb-3">
                      Scan this QR to complete UPI payment:
                    </div>
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-4 inline-block">
                      <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                        {paymentIntent.qrCodeData ? (
                          <QRCode value={paymentIntent.qrCodeData} size={180} />
                        ) : (
                        <QrCode className="w-24 h-24 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Payment ID: <span className="font-mono">{paymentIntent.id}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onSectionChange("transaction-status")}
                    className="w-full gradient-primary hover:opacity-90 text-white"
                  >
                    Check Payment Status
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => onSectionChange("home")}
              className="w-full text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
