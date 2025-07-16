import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetaMaskInstaller } from "@/components/wallet/metamask-installer";
import { WalletInfo } from "@/components/wallet/wallet-info";
import { NetworkSwitcher } from "@/components/wallet/network-switcher";
import { CheckCircle, Wallet, Link, Layers, Chrome, ArrowLeft, Smartphone, Sparkles } from "lucide-react";

interface WalletConnectProps {
  onSectionChange: (section: string) => void;
}

export function WalletConnect({ onSectionChange }: WalletConnectProps) {
  const { state, connectMetaMask, connectWalletConnect, connectBlocto, disconnect } = useWallet();

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
      icon: Smartphone,
      color: "blue",
      onClick: connectWalletConnect,
    },
    {
      id: "blocto",
      name: "Blocto",
      description: "Flow blockchain",
      icon: Sparkles,
      color: "purple",
      onClick: connectBlocto,
    },
  ];

  if (state.isConnected) {
    return (
      <section className="py-16">
        <div className="max-w-md mx-auto px-4 space-y-6">
          {/* Header */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => onSectionChange("home")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Wallet Dashboard</h1>
            <p className="text-slate-600">Manage your connected wallet and networks</p>
          </div>

          {/* Wallet Information */}
          <WalletInfo />

          {/* Network Switcher */}
          <NetworkSwitcher />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => onSectionChange("payment-form")}
              className="w-full gradient-primary text-white h-12"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Start Payment
            </Button>
            
            <Button 
              onClick={() => onSectionChange("qr-scanner")}
              variant="outline" 
              className="w-full h-12"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Check if MetaMask is not installed and show installer
  if (!state.isMetaMaskInstalled) {
    return (
      <section className="py-16">
        <div className="max-w-md mx-auto px-4 space-y-6">
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => onSectionChange("home")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <MetaMaskInstaller />
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
              const isMetaMaskOption = option.id === "metamask";
              const isDisabled = isConnecting || (isMetaMaskOption && !state.isMetaMaskInstalled);
              
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={option.onClick}
                  disabled={isDisabled}
                  className={`w-full justify-between p-4 h-auto border-slate-200 hover:border-${option.color}-400 hover:bg-${option.color}-50 transition-colors ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${option.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${option.color}-500`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-800">{option.name}</div>
                      <div className="text-xs text-slate-500">
                        {isMetaMaskOption && !state.isMetaMaskInstalled
                          ? "Not installed"
                          : option.description
                        }
                      </div>
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
