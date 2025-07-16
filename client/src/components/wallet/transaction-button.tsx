import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeb3Transactions } from "@/hooks/use-web3-transactions";
import { useWallet } from "@/contexts/wallet-context";
import { 
  Loader2, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ExternalLink 
} from "lucide-react";
import { getExplorerUrl } from "@/lib/wallet-utils";

interface TransactionButtonProps {
  to: string;
  amount: string;
  label?: string;
  onSuccess?: (hash: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TransactionButton({
  to,
  amount,
  label = "Send Transaction",
  onSuccess,
  onError,
  className = "",
  disabled = false,
}: TransactionButtonProps) {
  const { state } = useWallet();
  const { transactionState, sendTransaction, clearTransaction } = useWeb3Transactions();
  const [attempting, setAttempting] = useState(false);

  const handleSendTransaction = async () => {
    if (!state.isConnected) {
      onError?.("Wallet not connected");
      return;
    }

    setAttempting(true);
    try {
      const hash = await sendTransaction({
        to,
        value: amount,
      });
      
      onSuccess?.(hash);
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setAttempting(false);
    }
  };

  const getButtonContent = () => {
    if (transactionState.isLoading || attempting) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {transactionState.hash ? "Confirming..." : "Sending..."}
        </>
      );
    }

    if (transactionState.receipt && transactionState.receipt.status === 1) {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Transaction Confirmed
        </>
      );
    }

    return (
      <>
        <Send className="w-4 h-4 mr-2" />
        {label}
      </>
    );
  };

  const getButtonVariant = () => {
    if (transactionState.receipt && transactionState.receipt.status === 1) {
      return "default";
    }
    if (transactionState.error) {
      return "destructive";
    }
    return "default";
  };

  const explorerUrl = transactionState.hash && state.network 
    ? getExplorerUrl(transactionState.hash, state.network)
    : null;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSendTransaction}
        disabled={disabled || transactionState.isLoading || attempting}
        variant={getButtonVariant()}
        className={`w-full ${className}`}
      >
        {getButtonContent()}
      </Button>

      {transactionState.hash && (
        <div className="space-y-2">
          <div className="text-sm text-slate-600">Transaction Hash:</div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
            <span className="font-mono text-xs text-slate-800 truncate mr-2">
              {transactionState.hash}
            </span>
            {explorerUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(explorerUrl, '_blank')}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {transactionState.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{transactionState.error}</AlertDescription>
        </Alert>
      )}

      {(transactionState.hash || transactionState.error) && (
        <Button
          variant="outline"
          onClick={clearTransaction}
          className="w-full"
        >
          Clear Transaction
        </Button>
      )}
    </div>
  );
}