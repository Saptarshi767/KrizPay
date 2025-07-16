import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatAddress, formatBalance } from "@/lib/wallet-utils";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

export function WalletInfo() {
  const { state, updateBalance, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopyAddress = async () => {
    if (state.address) {
      await navigator.clipboard.writeText(state.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await updateBalance();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = () => {
    if (!state.isConnected) return "bg-slate-500";
    if (state.error) return "bg-red-500";
    return "bg-emerald-500";
  };

  const getStatusText = () => {
    if (!state.isConnected) return "Disconnected";
    if (state.error) return "Error";
    return "Connected";
  };

  if (!state.isConnected) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Connect your wallet to view account information
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="font-medium text-slate-800">{getStatusText()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {state.network || "Unknown"}
          </Badge>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Wallet Address</div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
            <span className="font-mono text-sm text-slate-800">
              {formatAddress(state.address || "", 6)}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://etherscan.io/address/${state.address}`, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">Balance</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={refreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-slate-800">
              {state.balance ? formatBalance(state.balance, 4) : "0.0000"}
            </div>
            <div className="text-sm text-slate-500">
              {state.network === "ethereum" ? "ETH" : state.network?.toUpperCase() || "TOKEN"}
            </div>
          </div>
        </div>

        {/* Chain Info */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Chain ID</div>
          <div className="bg-slate-50 rounded-lg p-3">
            <span className="font-mono text-sm text-slate-800">
              {state.chainId || "Unknown"}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Disconnect Button */}
        <Button
          variant="outline"
          onClick={disconnect}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}