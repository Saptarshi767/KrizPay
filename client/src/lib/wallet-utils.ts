import { ethers } from "ethers";

export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  polygon: {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  bsc: {
    id: 56,
    name: "BSC",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  },
};

export const TOKEN_CONFIGS = {
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "fab fa-ethereum",
    color: "bg-blue-500",
  },
  matic: {
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    icon: "fas fa-gem",
    color: "bg-purple-500",
  },
  bnb: {
    symbol: "BNB",
    name: "Binance Coin",
    decimals: 18,
    icon: "fas fa-coins",
    color: "bg-yellow-500",
  },
  flow: {
    symbol: "FLOW",
    name: "Flow",
    decimals: 8,
    icon: "fas fa-layer-group",
    color: "bg-green-500",
  },
};

export function formatAddress(address: string, length = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
}

export function formatBalance(balance: string, decimals = 4): string {
  if (!balance) return "0";
  const num = parseFloat(balance);
  return num.toFixed(decimals);
}

export function getExplorerUrl(hash: string, network: string): string {
  const chain = Object.values(SUPPORTED_CHAINS).find(c => c.name.toLowerCase() === network.toLowerCase());
  return chain ? `${chain.blockExplorer}/tx/${hash}` : "";
}

export async function switchToNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // If the chain is not added to MetaMask, add it
    if (error.code === 4902) {
      const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
      if (chain) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: chain.nativeCurrency,
              blockExplorerUrls: [chain.blockExplorer],
            },
          ],
        });
      }
    } else {
      throw error;
    }
  }
}

export async function addTokenToWallet(tokenAddress: string, tokenSymbol: string, tokenDecimals: number, tokenImage?: string): Promise<void> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to add token: ${error.message}`);
  }
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function getNetworkColor(chainId: number): string {
  const colors: { [key: number]: string } = {
    1: "bg-blue-500",      // Ethereum
    137: "bg-purple-500",  // Polygon
    56: "bg-yellow-500",   // BSC
    11155111: "bg-gray-500", // Sepolia
    80001: "bg-indigo-500",  // Mumbai
  };
  return colors[chainId] || "bg-gray-500";
}

export function getNetworkIcon(chainId: number): string {
  const icons: { [key: number]: string } = {
    1: "⟠",        // Ethereum
    137: "🔷",     // Polygon  
    56: "🔶",      // BSC
    11155111: "🧪", // Sepolia
    80001: "🧪",   // Mumbai
  };
  return icons[chainId] || "⚡";
}
