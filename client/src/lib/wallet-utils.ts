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
  } catch (error) {
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
