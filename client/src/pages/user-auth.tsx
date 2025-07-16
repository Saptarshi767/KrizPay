import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Shield, ArrowLeft } from "lucide-react";
import { formatAddress } from "@/lib/wallet-utils";

interface UserAuthProps {
  onSectionChange: (section: string) => void;
}

export function UserAuth({ onSectionChange }: UserAuthProps) {
  const { state: walletState } = useWallet();
  const [email, setEmail] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const registerUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      onSectionChange("home");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleRegister = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!walletState.address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");

    try {
      await registerUserMutation.mutateAsync({
        email,
        walletAddress: walletState.address,
      });
    } catch (error) {
      setError(error.message || "Registration failed");
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <section className="py-16">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl border-slate-200">
          <div className="gradient-purple p-6 text-white text-center">
            <UserPlus className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">User Registration</h2>
            <p className="text-purple-100 text-sm">Quick setup for KrizPay</p>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {!walletState.isConnected && (
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Please connect your wallet first to register
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label htmlFor="wallet" className="text-sm font-medium text-slate-700 mb-2 block">
                Wallet Address
              </Label>
              <Input
                id="wallet"
                placeholder="0x742d35Cc6648..."
                value={walletState.address ? formatAddress(walletState.address, 8) : ""}
                readOnly
                className="font-mono text-sm bg-slate-50"
              />
              <div className="text-xs text-slate-500 mt-1">
                {walletState.address ? "Auto-filled from connected wallet" : "Connect wallet to auto-fill"}
              </div>
            </div>

            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Privacy Notice</div>
                <div>We collect minimal information for compliance. Your data is encrypted and never shared.</div>
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
                className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label htmlFor="terms" className="text-sm text-slate-600">
                I agree to the{" "}
                <a href="#" className="text-purple-500 hover:underline">
                  Terms & Conditions
                </a>
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleRegister}
                disabled={!walletState.isConnected || registerUserMutation.isPending || !email || !agreedToTerms}
                className="w-full gradient-purple hover:opacity-90 text-white"
              >
                {registerUserMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => onSectionChange("home")}
                className="w-full text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
