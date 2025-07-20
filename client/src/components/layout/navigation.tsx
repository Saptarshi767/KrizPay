import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/wallet-utils";
import { Wallet, Shield, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const { state, connectMetaMask } = useWallet();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Coins className="text-white" size={16} />
            </div>
            <span className="text-xl font-semibold text-slate-800">KrizPay</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.isConnected ? (
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-600">
                  {formatAddress(state.address || "")}
                </span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={connectMetaMask}
                disabled={state.isConnecting}
                className="hidden sm:flex"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {state.isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin-dashboard")}
            >
              <Shield className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
