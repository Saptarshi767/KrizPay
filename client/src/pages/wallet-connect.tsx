import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Wallet, Link, Layers, Chrome, ArrowLeft } from "lucide-react";
import { formatAddress } from "@/lib/wallet-utils";

interface WalletConnectProps {
  onSectionChange: (section: string) => void;
}

export function WalletConnect({ onSectionChange }: WalletConnectProps) {
  const { state, connectMetaMask, connectWalletConnect, connectBlocto } = useWallet();

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Browser extension",
      icon: Chrome,
      color: "orange",
      onClick: connectMetaMask,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Mobile wallets",
      icon: Link,
      color: "blue",
      onClick: connectWalletConnect,
    },
    {
      id: "blocto",
      name: "Blocto",
      description: "Flow blockchain",
      icon: Layers,
      color: "purple",
      onClick: connectBlocto,
    },
  ];

  if (state.isConnected) {
    return (
      <section className="py-16">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-xl border-slate-200">
            <div className="gradient-primary p-6 text-white text-center">
              <Wallet className="w-12 h-12 mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Wallet Connected</h2>
              <p className="text-blue-100 text-sm mt-1">Ready to make payments</p>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                <span className="text-emerald-700 font-medium">Successfully Connected</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Wallet Address</div>
                <div className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded">
                  {formatAddress(state.address || "", 6)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Balance</div>
                <div className="text-lg font-semibold text-slate-800">
                  {state.balance ? `${parseFloat(state.balance).toFixed(4)} ETH` : "Loading..."}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Network</div>
                <div className="text-sm text-slate-800 capitalize">
                  {state.network || "Unknown"}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => onSectionChange("payment-form")}
                  className="w-full gradient-primary hover:opacity-90 text-white"
                >
                  Continue to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSectionChange("home")}
                  className="w-full"
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

  return (
    <section className="py-16">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl border-slate-200">
          <div className="gradient-primary p-6 text-white text-center">
            <Wallet className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
            <p className="text-blue-100 text-sm mt-1">Choose your preferred wallet to continue</p>
          </div>
          
          <CardContent className="p-6 space-y-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            
            {walletOptions.map((option) => {
              const Icon = option.icon;
              const isConnecting = state.isConnecting;
              
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={option.onClick}
                  disabled={isConnecting}
                  className={`w-full justify-between p-4 h-auto border-slate-200 hover:border-${option.color}-400 hover:bg-${option.color}-50 transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${option.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${option.color}-500`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-800">{option.name}</div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                  </div>
                  {isConnecting ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                  )}
                </Button>
              );
            })}
            
            <Button
              variant="ghost"
              onClick={() => onSectionChange("home")}
              className="w-full mt-4 text-slate-600 hover:text-slate-800"
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
