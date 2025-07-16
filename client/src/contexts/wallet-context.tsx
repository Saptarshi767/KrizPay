import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  network: string | null;
  isConnecting: boolean;
  error: string | null;
}

type WalletAction = 
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS"; payload: { address: string; balance: string; provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner; network: string } }
  | { type: "CONNECT_ERROR"; payload: string }
  | { type: "DISCONNECT" }
  | { type: "UPDATE_BALANCE"; payload: string };

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  provider: null,
  signer: null,
  network: null,
  isConnecting: false,
  error: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "CONNECT_START":
      return { ...state, isConnecting: true, error: null };
    case "CONNECT_SUCCESS":
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        error: null,
        ...action.payload,
      };
    case "CONNECT_ERROR":
      return {
        ...state,
        isConnecting: false,
        error: action.payload,
      };
    case "DISCONNECT":
      return initialState;
    case "UPDATE_BALANCE":
      return { ...state, balance: action.payload };
    default:
      return state;
  }
}

const WalletContext = createContext<{
  state: WalletState;
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  connectBlocto: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
} | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connectMetaMask = async () => {
    dispatch({ type: "CONNECT_START" });
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      dispatch({
        type: "CONNECT_SUCCESS",
        payload: {
          address,
          balance: ethers.formatEther(balance),
          provider,
          signer,
          network: network.name,
        },
      });
    } catch (error) {
      dispatch({
        type: "CONNECT_ERROR",
        payload: error.message || "Failed to connect MetaMask",
      });
    }
  };

  const connectWalletConnect = async () => {
    dispatch({ type: "CONNECT_START" });
    
    try {
      // WalletConnect implementation would go here
      // For now, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      throw new Error("WalletConnect integration not implemented yet");
    } catch (error) {
      dispatch({
        type: "CONNECT_ERROR",
        payload: error.message || "Failed to connect WalletConnect",
      });
    }
  };

  const connectBlocto = async () => {
    dispatch({ type: "CONNECT_START" });
    
    try {
      // Blocto implementation would go here
      // For now, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      throw new Error("Blocto integration not implemented yet");
    } catch (error) {
      dispatch({
        type: "CONNECT_ERROR",
        payload: error.message || "Failed to connect Blocto",
      });
    }
  };

  const disconnect = () => {
    dispatch({ type: "DISCONNECT" });
  };

  const updateBalance = async () => {
    if (state.provider && state.address) {
      try {
        const balance = await state.provider.getBalance(state.address);
        dispatch({
          type: "UPDATE_BALANCE",
          payload: ethers.formatEther(balance),
        });
      } catch (error) {
        console.error("Failed to update balance:", error);
      }
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectMetaMask();
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        state,
        connectMetaMask,
        connectWalletConnect,
        connectBlocto,
        disconnect,
        updateBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
