import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency, CurrencyCode } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";

export function SettingsModal() {
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-none border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-x-[-2px]">
          <Settings className="w-6 h-6" strokeWidth={2.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className="neo-border bg-background p-0 gap-0 max-w-sm w-[90vw] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] border-2 border-black dark:border-white sm:rounded-none">
        <DialogHeader className="p-4 border-b-2 border-black dark:border-white bg-accent">
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-8">
          {/* Language Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Language</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage("ja")}
                className={`neo-border p-3 flex items-center justify-between transition-all active:translate-y-[2px] active:shadow-none ${
                  language === "ja" 
                    ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" 
                    : "bg-background hover:bg-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                }`}
              >
                <span className="font-bold">日本語</span>
                {language === "ja" && <Check className="w-4 h-4" strokeWidth={3} />}
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`neo-border p-3 flex items-center justify-between transition-all active:translate-y-[2px] active:shadow-none ${
                  language === "en" 
                    ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" 
                    : "bg-background hover:bg-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                }`}
              >
                <span className="font-bold">English</span>
                {language === "en" && <Check className="w-4 h-4" strokeWidth={3} />}
              </button>
            </div>
          </div>

          {/* Currency Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Currency</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(availableCurrencies).map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`neo-border p-3 flex items-center justify-between transition-all active:translate-y-[2px] active:shadow-none ${
                    currency === c.code
                      ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                      : "bg-background hover:bg-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black">{c.symbol}</span>
                    <span className="text-xs font-bold opacity-80">{c.code}</span>
                  </div>
                  {currency === c.code && <Check className="w-4 h-4" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
