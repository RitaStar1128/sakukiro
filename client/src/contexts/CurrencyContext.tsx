import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CurrencyCode = "JPY" | "USD" | "EUR" | "GBP" | "KRW" | "CNY";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  position: "prefix" | "suffix";
  decimals: number;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  JPY: { code: "JPY", symbol: "¥", position: "prefix", decimals: 0 },
  USD: { code: "USD", symbol: "$", position: "prefix", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", position: "prefix", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", position: "prefix", decimals: 2 },
  KRW: { code: "KRW", symbol: "₩", position: "prefix", decimals: 0 },
  CNY: { code: "CNY", symbol: "¥", position: "prefix", decimals: 2 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amount: number) => string;
  getSymbol: () => string;
  config: CurrencyConfig;
  availableCurrencies: typeof CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("JPY");

  useEffect(() => {
    const saved = localStorage.getItem("kaimono_currency");
    if (saved && saved in CURRENCIES) {
      setCurrencyState(saved as CurrencyCode);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("kaimono_currency", code);
  };

  const config = CURRENCIES[currency];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  };

  const getSymbol = () => config.symbol;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        getSymbol,
        config,
        availableCurrencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
