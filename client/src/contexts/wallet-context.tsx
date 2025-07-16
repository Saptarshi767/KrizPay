import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  network: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  isMetaMaskInstalled: boolean;
}

type WalletAction = 
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS"; payload: { address: string; balance: string; provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner; network: string; chainId: number } }
  | { type: "CONNECT_ERROR"; payload: string }
  | { type: "DISCONNECT" }
  | { type: "UPDATE_BALANCE"; payload: string }
  | { type: "NETWORK_CHANGED"; payload: { network: string; chainId: number } }
  | { type: "SET_METAMASK_STATUS"; payload: boolean };

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  provider: null,
  signer: null,
  network: null,
  chainId: null,
  isConnecting: false,
  error: null,
  isMetaMaskInstalled: typeof window !== 'undefined' && !!window.ethereum,
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
    case "NETWORK_CHANGED":
      return { ...state, network: action.payload.network, chainId: action.payload.chainId };
    case "SET_METAMASK_STATUS":
      return { ...state, isMetaMaskInstalled: action.payload };
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
  switchNetwork: (chainId: number) => Promise<void>;
  addNetwork: (network: any) => Promise<void>;
  getNetworkName: (chainId: number) => string;
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
          chainId: Number(network.chainId),
        },
      });
    } catch (error: any) {
      let errorMessage = "Failed to connect MetaMask";
      
      if (error.code === 4001) {
        errorMessage = "User rejected the connection request";
      } else if (error.code === -32002) {
        errorMessage = "MetaMask is already processing a request";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: "CONNECT_ERROR",
        payload: errorMessage,
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

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error("Network not added to MetaMask. Please add it manually.");
      }
      throw error;
    }
  };

  const addNetwork = async (network: any) => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [network],
      });
    } catch (error: any) {
      throw new Error(`Failed to add network: ${error.message}`);
    }
  };

  const getNetworkName = (chainId: number): string => {
    const networks: { [key: number]: string } = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      11155111: "Sepolia",
      80001: "Mumbai",
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  useEffect(() => {
    // Check MetaMask installation
    const checkMetaMask = () => {
      const isInstalled = typeof window !== 'undefined' && !!window.ethereum;
      dispatch({ type: "SET_METAMASK_STATUS", payload: isInstalled });
    };

    checkMetaMask();

    // Check if wallet is already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectMetaMask();
    }

    // Set up event listeners for MetaMask
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== state.address) {
          connectMetaMask();
        }
      };

      const handleChainChanged = (chainId: string) => {
        const chainIdNum = parseInt(chainId, 16);
        const networkName = getNetworkName(chainIdNum);
        dispatch({
          type: "NETWORK_CHANGED",
          payload: { network: networkName, chainId: chainIdNum },
        });
        
        // Refresh balance when network changes
        updateBalance();
      };

      const handleConnect = (connectInfo: { chainId: string }) => {
        console.log("MetaMask connected:", connectInfo);
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log("MetaMask disconnected:", error);
        disconnect();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("connect", handleConnect);
      window.ethereum.on("disconnect", handleDisconnect);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
          window.ethereum.removeListener("connect", handleConnect);
          window.ethereum.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [state.address]);

  return (
    <WalletContext.Provider
      value={{
        state,
        connectMetaMask,
        connectWalletConnect,
        connectBlocto,
        disconnect,
        updateBalance,
        switchNetwork,
        addNetwork,
        getNetworkName,
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
