import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States" },
  { code: "EUR", symbol: "€", name: "Euro", country: "European Union" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", country: "Canada" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", country: "Australia" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", country: "Switzerland" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", country: "Brazil" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", country: "Mexico" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", country: "Singapore" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", country: "Hong Kong" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", country: "Sweden" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", country: "Norway" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", country: "Denmark" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty", country: "Poland" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", country: "Czech Republic" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", country: "Hungary" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", country: "Russia" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", country: "Turkey" },
  { code: "ZAR", symbol: "R", name: "South African Rand", country: "South Africa" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", country: "South Korea" },
  { code: "THB", symbol: "฿", name: "Thai Baht", country: "Thailand" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", country: "Malaysia" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", country: "Indonesia" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", country: "Philippines" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", country: "Vietnam" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "United Arab Emirates" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", country: "Saudi Arabia" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound", country: "Egypt" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", country: "Kenya" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", country: "Ghana" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", country: "Morocco" },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar", country: "Tunisia" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar", country: "Algeria" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound", country: "Lebanon" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar", country: "Jordan" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", country: "Qatar" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", country: "Kuwait" },
  { code: "BHD", symbol: "ب.د", name: "Bahraini Dinar", country: "Bahrain" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial", country: "Oman" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", country: "Israel" },
  { code: "IRR", symbol: "﷼", name: "Iranian Rial", country: "Iran" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", country: "Pakistan" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", country: "Bangladesh" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", country: "Sri Lanka" },
  { code: "NPR", symbol: "₨", name: "Nepalese Rupee", country: "Nepal" },
  { code: "AFN", symbol: "؋", name: "Afghan Afghani", country: "Afghanistan" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", country: "Myanmar" },
  { code: "LAK", symbol: "₭", name: "Lao Kip", country: "Laos" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", country: "Cambodia" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar", country: "Brunei" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", country: "Taiwan" },
  { code: "MNT", symbol: "₮", name: "Mongolian Tögrög", country: "Mongolia" },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", country: "Kazakhstan" },
  { code: "UZS", symbol: "so'm", name: "Uzbekistani Som", country: "Uzbekistan" },
  { code: "KGS", symbol: "лв", name: "Kyrgyzstani Som", country: "Kyrgyzstan" },
  { code: "TJS", symbol: "ЅМ", name: "Tajikistani Somoni", country: "Tajikistan" },
  { code: "TMT", symbol: "T", name: "Turkmenistani Manat", country: "Turkmenistan" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", country: "Georgia" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram", country: "Armenia" },
  { code: "AZN", symbol: "₼", name: "Azerbaijani Manat", country: "Azerbaijan" },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble", country: "Belarus" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", country: "Ukraine" },
  { code: "MDL", symbol: "L", name: "Moldovan Leu", country: "Moldova" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", country: "Bulgaria" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", country: "Romania" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", country: "Croatia" },
  { code: "BAM", symbol: "KM", name: "Bosnia-Herzegovina Mark", country: "Bosnia and Herzegovina" },
  { code: "RSD", symbol: "Дин.", name: "Serbian Dinar", country: "Serbia" },
  { code: "MKD", symbol: "ден", name: "Macedonian Denar", country: "North Macedonia" },
  { code: "ALL", symbol: "L", name: "Albanian Lek", country: "Albania" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Montenegro" },
];

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCurrencies = currencies.filter(currency => 
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="font-mono">{selectedCurrency.symbol}</span>
          <span className="text-xs text-muted-foreground">{selectedCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search currencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background"
          />
        </div>
        {filteredCurrencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => onCurrencyChange(currency)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg">{currency.symbol}</span>
              <div>
                <div className="font-medium">{currency.code}</div>
                <div className="text-xs text-muted-foreground">{currency.country}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground max-w-24 truncate">
              {currency.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: Currency): string {
  // For currencies with symbols that go after the amount
  const suffixCurrencies = ['SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY'];
  
  if (suffixCurrencies.includes(currency.code)) {
    return `${amount.toFixed(2)} ${currency.symbol}`;
  }
  
  // For most currencies, symbol goes before
  return `${currency.symbol}${amount.toFixed(2)}`;
}

// Default currency
export const defaultCurrency: Currency = currencies.find(c => c.code === 'USD') || currencies[0];