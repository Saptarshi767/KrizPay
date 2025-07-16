import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useCryptoPrices() {
  const queryClient = useQueryClient();

  const {
    data: prices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/prices"],
    staleTime: 15000, // 15 seconds
    refetchInterval: 15000,
  });

  const fetchLatestPrices = async () => {
    try {
      await apiRequest("POST", "/api/prices/fetch");
      queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
    } catch (error) {
      console.error("Failed to fetch latest prices:", error);
    }
  };

  useEffect(() => {
    // Fetch latest prices on mount
    fetchLatestPrices();
  }, []);

  const getPriceInINR = (token: string) => {
    if (!prices || !Array.isArray(prices)) return 0;
    const price = prices.find(p => p.token === token.toLowerCase());
    return price ? parseFloat(price.priceInr) : 0;
  };

  const convertToINR = (amount: number, token: string) => {
    const priceInINR = getPriceInINR(token);
    return amount * priceInINR;
  };

  return {
    prices,
    isLoading,
    error,
    getPriceInINR,
    convertToINR,
    fetchLatestPrices,
  };
}
