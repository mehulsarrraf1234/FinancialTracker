import { createContext, useContext, useState, useEffect } from "react";
import { Currency, defaultCurrency } from "@/components/currency-selector";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("selected-currency");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultCurrency;
      }
    }
    return defaultCurrency;
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("selected-currency", JSON.stringify(newCurrency));
  };

  const formatAmount = (amount: number): string => {
    // For currencies with symbols that go after the amount
    const suffixCurrencies = ['SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY'];
    
    if (suffixCurrencies.includes(currency.code)) {
      return `${amount.toFixed(2)} ${currency.symbol}`;
    }
    
    // For most currencies, symbol goes before
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
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