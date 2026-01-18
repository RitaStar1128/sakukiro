import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { History, ShoppingBag, Delete, Check, X, Globe } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, language, toggleLanguage } = useLanguage();
  const [amount, setAmount] = useState("");
  const [categoryKey, setCategoryKey] = useState(CATEGORY_KEYS[0]);
  const [note, setNote] = useState("");
  const [_, setLocation] = useLocation();

  // テンキー入力処理
  const handleNumClick = (num: string) => {
    if (amount.length >= 7) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleSubmit = () => {
    if (!amount) {
      toast.error(t("inputAmount"));
      return;
    }

    const newRecord = {
      id: crypto.randomUUID(),
      amount: parseInt(amount, 10),
      categoryKey, // Save the key, not the translated string
      note,
      date: new Date().toISOString(),
    };

    const storedData = localStorage.getItem("kaimono_records");
    const records = storedData ? JSON.parse(storedData) : [];
    localStorage.setItem("kaimono_records", JSON.stringify([newRecord, ...records]));

    toast.success(t("saved"));
    
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
      {/* Header - Minimal & Accessible */}
      <header className="flex justify-between items-center px-4 py-3 border-b-2 border-black dark:border-white bg-white dark:bg-black shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase">Kaimono</h1>
          </div>
          
          {/* Language Toggle - Placed near title, far from history button */}
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold border-2 border-black dark:border-white px-1.5 py-0.5 hover:bg-accent active:translate-y-[1px] transition-all ml-1"
          >
            {language === "ja" ? "EN" : "JP"}
          </button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/history")}
          className="w-10 h-10 rounded-none border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-y-1"
        >
          <History className="w-6 h-6" strokeWidth={2.5} />
        </Button>
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
              className="neo-input h-24 flex items-end justify-end text-6xl tracking-tighter overflow-hidden bg-white dark:bg-black transition-all group-focus-within:shadow-[6px_6px_0px_0px_var(--color-safety-orange)]"
            >
              <span className="text-3xl mr-2 self-end mb-2 font-bold text-muted-foreground">¥</span>
              <span className={amount ? "text-foreground" : "text-muted-foreground/20"}>
                {amount || "0"}
              </span>
            </motion.div>
          </div>

          {/* Secondary Inputs - Compact Row */}
          <div className="grid grid-cols-[1.2fr_1.8fr] gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest pl-1">{t("category")}</label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger className="neo-input h-12 w-full text-sm px-3 py-0 border-2 shadow-none focus:shadow-[2px_2px_0px_0px_var(--color-safety-orange)]">
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
              <label className="text-[10px] font-black uppercase tracking-widest pl-1">{t("note")}</label>
              <Input 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder={t("notePlaceholder")} 
                className="neo-input h-12 text-sm px-3 py-0 border-2 shadow-none focus:shadow-[2px_2px_0px_0px_var(--color-safety-orange)] placeholder:text-muted-foreground/40"
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
              onClick={handleClear}
              className="neo-btn bg-muted text-muted-foreground text-xl hover:bg-muted/80 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center rounded-sm"
            >
              <span className="font-black">AC</span>
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
            className="h-20 shrink-0 text-2xl font-black uppercase tracking-[0.2em] border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all bg-primary text-primary-foreground hover:bg-primary hover:brightness-110 w-full rounded-sm flex items-center justify-center gap-3"
          >
            {t("confirm")} <Check className="w-8 h-8" strokeWidth={4} />
          </motion.button>
        </div>
      </main>
    </motion.div>
  );
}
