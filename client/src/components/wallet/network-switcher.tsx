import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SUPPORTED_CHAINS } from "@/lib/wallet-utils";
import { Globe, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

export function NetworkSwitcher() {
  const { state, switchNetwork, addNetwork } = useWallet();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  const handleSwitchNetwork = async (chainId: number) => {
    if (!state.isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setSwitching(true);
    setError("");

    try {
      await switchNetwork(chainId);
    } catch (error: any) {
      if (error.message.includes("not added")) {
        // Try to add the network
        const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
        if (chain) {
          try {
            await addNetwork({
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: chain.nativeCurrency,
              blockExplorerUrls: [chain.blockExplorer],
            });
          } catch (addError: any) {
            setError(`Failed to add network: ${addError.message}`);
          }
        }
      } else {
        setError(error.message);
      }
    } finally {
      setSwitching(false);
    }
  };

  if (!state.isMetaMaskInstalled) {
    return (
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          MetaMask is not installed. Please install MetaMask to switch networks.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-800">Network</span>
          </div>
          {state.isConnected && (
            <Badge variant="outline" className="text-xs">
              {state.network || "Unknown"}
            </Badge>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-2">
          {Object.values(SUPPORTED_CHAINS).map((chain) => {
            const isCurrentNetwork = state.chainId === chain.id;
            const isSupported = Object.values(SUPPORTED_CHAINS).some(c => c.id === chain.id);

            return (
              <Button
                key={chain.id}
                variant={isCurrentNetwork ? "default" : "outline"}
                onClick={() => handleSwitchNetwork(chain.id)}
                disabled={switching || !state.isConnected || isCurrentNetwork}
                className={`justify-between h-auto p-3 ${
                  isCurrentNetwork 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "hover:border-slate-400"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isCurrentNetwork ? "bg-white" : "bg-slate-400"
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">{chain.name}</div>
                    <div className={`text-xs ${
                      isCurrentNetwork ? "text-emerald-100" : "text-slate-500"
                    }`}>
                      {chain.nativeCurrency.symbol}
                    </div>
                  </div>
                </div>
                
                {switching && state.chainId === chain.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentNetwork ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </Button>
            );
          })}
        </div>

        {!state.isConnected && (
          <div className="text-center text-sm text-slate-500 mt-4">
            Connect your wallet to switch networks
          </div>
        )}
      </CardContent>
    </Card>
  );
}