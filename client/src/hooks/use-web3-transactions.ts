import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/wallet-context";
import { useToast } from "@/hooks/use-toast";

interface TransactionState {
  isLoading: boolean;
  hash: string | null;
  error: string | null;
  receipt: ethers.TransactionReceipt | null;
}

interface SendTransactionParams {
  to: string;
  value: string; // in ETH
  data?: string;
  gasLimit?: string;
}

export function useWeb3Transactions() {
  const { state } = useWallet();
  const { toast } = useToast();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isLoading: false,
    hash: null,
    error: null,
    receipt: null,
  });

  const estimateGas = useCallback(async (params: SendTransactionParams): Promise<bigint> => {
    if (!state.provider || !state.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const gasEstimate = await state.provider.estimateGas({
        to: params.to,
        value: ethers.parseEther(params.value),
        data: params.data || "0x",
      });
      
      // Add 20% buffer to gas estimate
      return gasEstimate * BigInt(120) / BigInt(100);
    } catch (error: any) {
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }, [state.provider, state.signer]);

  const sendTransaction = useCallback(async (params: SendTransactionParams): Promise<string> => {
    if (!state.provider || !state.signer) {
      throw new Error("Wallet not connected");
    }

    setTransactionState({
      isLoading: true,
      hash: null,
      error: null,
      receipt: null,
    });

    try {
      // Estimate gas if not provided
      let gasLimit = params.gasLimit;
      if (!gasLimit) {
        const estimatedGas = await estimateGas(params);
        gasLimit = estimatedGas.toString();
      }

      // Send transaction
      const tx = await state.signer.sendTransaction({
        to: params.to,
        value: ethers.parseEther(params.value),
        data: params.data || "0x",
        gasLimit: gasLimit,
      });

      setTransactionState(prev => ({
        ...prev,
        hash: tx.hash,
      }));

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        setTransactionState({
          isLoading: false,
          hash: tx.hash,
          error: null,
          receipt,
        });

        toast({
          title: "Transaction Confirmed",
          description: "Your transaction was successfully confirmed",
        });

        return tx.hash;
      } else {
        throw new Error("Transaction failed");
      }

    } catch (error: any) {
      const errorMessage = error.reason || error.message || "Transaction failed";
      
      setTransactionState({
        isLoading: false,
        hash: null,
        error: errorMessage,
        receipt: null,
      });

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw new Error(errorMessage);
    }
  }, [state.provider, state.signer, estimateGas, toast]);

  const waitForTransaction = useCallback(async (hash: string): Promise<ethers.TransactionReceipt | null> => {
    if (!state.provider) {
      throw new Error("Provider not available");
    }

    try {
      setTransactionState(prev => ({
        ...prev,
        isLoading: true,
        hash,
      }));

      const receipt = await state.provider.waitForTransaction(hash);
      
      setTransactionState({
        isLoading: false,
        hash,
        error: null,
        receipt,
      });

      return receipt;
    } catch (error: any) {
      setTransactionState({
        isLoading: false,
        hash,
        error: error.message,
        receipt: null,
      });
      throw error;
    }
  }, [state.provider]);

  const getTransactionStatus = useCallback(async (hash: string) => {
    if (!state.provider) {
      throw new Error("Provider not available");
    }

    try {
      const tx = await state.provider.getTransaction(hash);
      const receipt = await state.provider.getTransactionReceipt(hash);
      
      return {
        transaction: tx,
        receipt,
        isPending: !receipt,
        isConfirmed: receipt?.status === 1,
        isFailed: receipt?.status === 0,
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }, [state.provider]);

  const clearTransaction = useCallback(() => {
    setTransactionState({
      isLoading: false,
      hash: null,
      error: null,
      receipt: null,
    });
  }, []);

  return {
    transactionState,
    sendTransaction,
    waitForTransaction,
    getTransactionStatus,
    estimateGas,
    clearTransaction,
  };
}