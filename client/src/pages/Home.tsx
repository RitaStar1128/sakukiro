import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { History, ShoppingBag, Delete, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SettingsModal } from "@/components/SettingsModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { HelpModal } from "@/components/HelpModal";
import { DonationModal } from "@/components/DonationModal";
import { HelpCircle } from "lucide-react";

// UX_RATIONALE:
// - fitts_law: 画面下部（サムゾーン）に操作系を集約。テンキーと確定ボタンを画面の約50%〜60%の領域に拡大し、親指での誤タップを極限まで減らす。
// - jacob_law: 電卓アプリのメンタルモデルを踏襲。クリア(C)や削除(Back)の配置を直感的な位置に。
// - miller_law: 画面上の情報量を「金額」「カテゴリ」「備考」の3つに絞り、認知負荷を下げる。
// - peak_end_rule: 入力完了時のアニメーションと触覚的なフィードバック（視覚的）を強化し、記録完了の快感を提供する。

const CATEGORY_KEYS = [
  "cat_food",
  "cat_daily",
  "cat_transport",
  "cat_entertainment",
  "cat_clothing",
  "cat_medical",
  "cat_other"
];

export default function Home() {
  const { t } = useLanguage();
  const { getSymbol, config } = useCurrency();
  const [amount, setAmount] = useState("");
  const [categoryKey, setCategoryKey] = useState(CATEGORY_KEYS[0]);
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [_, setLocation] = useLocation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // 初回訪問判定
  useEffect(() => {
    const hasVisited = localStorage.getItem("has_visited_sakukiro");
    if (!hasVisited) {
      setIsHelpOpen(true);
      localStorage.setItem("has_visited_sakukiro", "true");
    }
  }, []);

  useEffect(() => {
    document.title = "サクキロ (SAKUKIRO) - 最速の支出管理・家計簿アプリ";
  }, []);

  // テンキー入力処理
  const handleNumClick = (num: string) => {
    // 小数点入力の制御
    if (num === ".") {
      if (amount.includes(".")) return; // 既に小数点がある場合は無視
      if (amount === "") {
        setAmount("0."); // 空の場合は "0." とする
        return;
      }
    }

    // 小数点以下の桁数制限
    if (amount.includes(".")) {
      const parts = amount.split(".");
      if (parts[1] && parts[1].length >= config.decimals) return;
    }

    // 整数部の桁数制限（適当な上限）
    if (!amount.includes(".") && amount.length >= 9) return;

    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) === 0) {
      toast.error(t("inputAmount"));
      return;
    }

    const newRecord = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      categoryKey, // Save the key, not the translated string
      note,
      date: new Date().toISOString(),
      currency: config.code, // 記録時の通貨を保存
    };

    const storedData = localStorage.getItem("kaimono_records");
    const records = storedData ? JSON.parse(storedData) : [];
    localStorage.setItem("kaimono_records", JSON.stringify([newRecord, ...records]));

    // ボタン内フィードバックを表示
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
    
    setAmount("");
    setNote("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[100dvh] flex flex-col bg-background text-foreground font-sans overflow-hidden touch-none"
    >
      <PWAInstallPrompt />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      {/* Header - Minimal & Accessible */}
      <header className="flex justify-between items-center px-4 py-3 border-b-2 border-black dark:border-white bg-white dark:bg-black shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase">SAKUKIRO</h1>
          </div>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-8 h-8 flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-accent transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

          <div className="flex items-center gap-2">
            <DonationModal />
            <SettingsModal />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/history")}
            className="w-10 h-10 rounded-none border-2 border-black dark:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-y-1"
          >
            <History className="w-6 h-6" strokeWidth={2.5} />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative">
        {/* Upper Section: Display & Inputs */}
        <div className="flex flex-col px-4 pt-4 pb-2 gap-4 shrink-0">
          {/* Amount Display - The Hero */}
          <div className="relative group">
            <div className="absolute top-2 left-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground pointer-events-none">
              {t("amount")}
            </div>
            <motion.div 
              key={amount}
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className="neo-input h-24 flex items-end justify-end text-7xl tracking-tighter overflow-hidden bg-white dark:bg-black transition-all group-focus-within:shadow-[6px_6px_0px_0px_var(--color-safety-orange)] pr-14 relative"
            >
              <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none">
                <span className="text-xs font-black text-muted-foreground/50 tracking-widest">{config.code}</span>
              </div>
              <span className="text-4xl mr-2 self-end mb-2 font-bold text-muted-foreground">{getSymbol()}</span>
              <span className={amount ? "text-foreground" : "text-muted-foreground/20"}>
                {amount || "0"}
              </span>
              
              {/* Clear Button inside Display */}
              {amount && (
                <button 
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={3} />
                </button>
              )}
            </motion.div>
          </div>

          {/* Secondary Inputs - Compact Row */}
          <div className="grid grid-cols-[1.2fr_1.8fr] gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-widest pl-1">{t("category")}</label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger 
                  className="w-full text-base font-bold px-3 py-0 border-2 border-black dark:border-white rounded-none shadow-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_var(--color-safety-orange)] transition-all bg-white dark:bg-black box-border"
                  style={{ height: '56px' }}
                >
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>
                <SelectContent className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] max-h-[40vh]">
                  {CATEGORY_KEYS.map((key) => (
                    <SelectItem key={key} value={key} className="font-bold py-3 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      {t(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-widest pl-1">{t("note")}</label>
              <Input 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder={t("notePlaceholder")} 
                className="text-base font-bold px-3 py-0 border-2 border-black dark:border-white rounded-none shadow-none focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_var(--color-safety-orange)] placeholder:text-muted-foreground/40 transition-all bg-white dark:bg-black box-border"
                style={{ height: '56px' }}
              />
            </div>
          </div>
        </div>

        {/* Lower Section: Keypad & Action - The Thumb Zone */}
        <div className="flex-1 flex flex-col p-4 pt-2 gap-3 min-h-0">
          <div className="flex-1 grid grid-cols-3 gap-3">
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumClick(num.toString())}
                className="neo-btn bg-white dark:bg-black text-3xl hover:bg-gray-50 dark:hover:bg-gray-900 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center rounded-sm"
              >
                {num}
              </motion.button>
            ))}
            
            {/* Bottom Row of Keypad */}
            <button
              onClick={() => handleNumClick(".")}
              className="neo-btn bg-white dark:bg-black text-3xl hover:bg-gray-50 dark:hover:bg-gray-900 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center rounded-sm pb-2"
              disabled={config.decimals === 0} // 小数点なし通貨の場合は無効化
            >
              <span className="font-black">.</span>
            </button>
            <button
              onClick={() => handleNumClick("0")}
              className="neo-btn bg-white dark:bg-black text-3xl hover:bg-gray-50 dark:hover:bg-gray-900 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center rounded-sm"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="neo-btn bg-muted text-muted-foreground hover:bg-muted/80 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center rounded-sm"
            >
              <Delete className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>

          {/* Confirm Button - Massive & Satisfying */}
          <motion.button 
            whileTap={{ scale: 0.98, y: 4, x: 4, boxShadow: "0px 0px 0px 0px rgba(0,0,0,0)" }}
            onClick={handleSubmit}
            disabled={isSaved}
            className={`h-20 shrink-0 text-2xl font-black uppercase tracking-[0.2em] border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all w-full rounded-sm flex items-center justify-center gap-3 ${
              isSaved 
                ? "bg-green-500 text-white border-green-700" 
                : "bg-primary text-primary-foreground hover:bg-primary hover:brightness-110"
            }`}
          >
            {isSaved ? (
              <>
                {t("saved")}! <Check className="w-8 h-8" strokeWidth={4} />
              </>
            ) : (
              <>
                {t("confirm")} <Check className="w-8 h-8" strokeWidth={4} />
              </>
            )}
          </motion.button>
        </div>
      </main>
    </motion.div>
  );
}
