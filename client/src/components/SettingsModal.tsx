import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency, CurrencyCode } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Smartphone } from "lucide-react";
import { modalBodyClass, modalCloseButtonClass, modalContentClass, modalHeaderClass, modalIconBoxClass, modalTitleClass } from "@/components/modalStyles";

export function SettingsModal() {
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { theme, setTheme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-none border-2 border-black dark:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-x-[-2px]">
          <Settings className="w-6 h-6" strokeWidth={2.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className={modalContentClass}>
        <DialogHeader className={modalHeaderClass}>
          <div className="flex items-center gap-3">
            <div className={modalIconBoxClass}>
              <Settings className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
            </div>
            <DialogTitle className={modalTitleClass}>Settings</DialogTitle>
          </div>
          <DialogClose asChild>
            <button 
              className={modalCloseButtonClass}
            >
              <X className="w-6 h-6" strokeWidth={4} />
            </button>
          </DialogClose>
        </DialogHeader>
        
        <div className={`${modalBodyClass} p-6 space-y-8`}>
          {/* Language Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Language</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage("ja")}
                className={`neo-border p-3 flex items-center justify-between transition-all active:translate-y-[2px]  ${
                  language === "ja" 
                    ? "bg-primary text-primary-foreground " 
                    : "bg-background hover:bg-accent "
                }`}
              >
                <span className="font-bold">日本語</span>
                {language === "ja" && <Check className="w-4 h-4" strokeWidth={3} />}
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`neo-border p-3 flex items-center justify-between transition-all active:translate-y-[2px]  ${
                  language === "en" 
                    ? "bg-primary text-primary-foreground " 
                    : "bg-background hover:bg-accent "
                }`}
              >
                <span className="font-bold">English</span>
                {language === "en" && <Check className="w-4 h-4" strokeWidth={3} />}
              </button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`neo-border p-3 flex flex-col items-center justify-center gap-2 transition-all active:translate-y-[2px]  ${
                  theme === "light"
                    ? "bg-primary text-primary-foreground "
                    : "bg-background hover:bg-accent "
                }`}
              >
                <Sun className="w-6 h-6" strokeWidth={2.5} />
                <span className="text-xs font-bold">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`neo-border p-3 flex flex-col items-center justify-center gap-2 transition-all active:translate-y-[2px]  ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground "
                    : "bg-background hover:bg-accent "
                }`}
              >
                <Moon className="w-6 h-6" strokeWidth={2.5} />
                <span className="text-xs font-bold">Dark</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`neo-border p-3 flex flex-col items-center justify-center gap-2 transition-all active:translate-y-[2px]  ${
                  theme === "system"
                    ? "bg-primary text-primary-foreground "
                    : "bg-background hover:bg-accent "
                }`}
              >
                <Monitor className="w-6 h-6" strokeWidth={2.5} />
                <span className="text-xs font-bold">System</span>
              </button>
            </div>
          </div>

          {/* Mobile Access Section - Only visible on desktop */}
          <div className="space-y-3 hidden sm:block">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mobile Access</h3>
            <button
              onClick={() => {
                localStorage.removeItem("kaimono_force_pc");
                window.location.reload();
              }}
              className="w-full neo-border p-3 flex items-center justify-between bg-background hover:bg-accent  transition-all active:translate-y-[2px] "
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5" strokeWidth={2.5} />
                <span className="font-bold">{language === 'ja' ? 'モバイルで開く (QR)' : 'Open on Mobile (QR)'}</span>
              </div>
            </button>
          </div>

          {/* Currency Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Currency</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(availableCurrencies).map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`neo-border p-3 flex items-center justify-between transition-all active:translate-y-[2px]  ${
                    currency === c.code
                      ? "bg-primary text-primary-foreground "
                      : "bg-background hover:bg-accent "
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
