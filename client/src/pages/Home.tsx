import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useRoute } from "wouter";
import { History, ShoppingBag, Delete, Check, X, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SettingsModal } from "@/components/SettingsModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { HelpModal } from "@/components/HelpModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { HelpCircle } from "lucide-react";

// UX方針:
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
  const { currency, getSymbol, config } = useCurrency();
  const [amount, setAmount] = useState("");
  const [categoryKey, setCategoryKey] = useState(CATEGORY_KEYS[0]);
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute("/edit/:id");
  const isEditMode = match && !!params?.id;
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // フォントサイズ調整用のRefとState
  const spanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(72);
  
  // 表示用のフォーマット済みテキストを計算
  const displayText = amount ? (() => {
    const parts = amount.split('.');
    const integerPart = Number(parts[0]).toLocaleString();
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  })() : "0";

  // 初回訪問判定
  useEffect(() => {
    const hasVisited = localStorage.getItem("has_visited_sakukiro");
    if (!hasVisited) {
      setIsHelpOpen(true);
      localStorage.setItem("has_visited_sakukiro", "true");
    }
  }, []);

  useEffect(() => {
    document.title = isEditMode 
      ? "記録の編集 - サクキロ" 
      : "サクキロ (SAKUKIRO) - 最速の支出管理・家計簿アプリ";
  }, [isEditMode]);

  // 編集モード時の初期データ読み込み
  useEffect(() => {
    if (isEditMode && params?.id) {
      const storedData = localStorage.getItem("kaimono_records");
      if (storedData) {
        const records = JSON.parse(storedData);
        const record = records.find((r: any) => r.id === params.id);
        if (record) {
          setAmount(record.amount.toString());
          setCategoryKey(record.categoryKey);
          setNote(record.note || "");
          setOriginalDate(record.date);
        } else {
          toast.error("記録が見つかりません");
          setLocation("/history");
        }
      }
    }
  }, [isEditMode, params?.id, setLocation]);

  // 設定で通貨を変更したときに入力中の金額をリセット（新規作成時のみ）
  useEffect(() => {
    if (!isEditMode) {
      setAmount("");
    }
  }, [currency, isEditMode]);

  // フォントサイズ自動調整ロジック（桁数ベース＋フィット調整）
  useLayoutEffect(() => {
    const adjustFontSize = () => {
      if (!spanRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth - 8; // paddingを考慮
      const span = spanRef.current;

      const digitCount = displayText.replace(/\D/g, "").length || 1;
      const baseSize = Math.max(28, Math.min(72, 72 - (digitCount - 1) * 4));

      let nextSize = baseSize;
      span.style.fontSize = `${nextSize}px`;
      span.offsetHeight;

      while (span.scrollWidth > containerWidth && nextSize > 16) {
        nextSize -= 1;
        span.style.fontSize = `${nextSize}px`;
        span.offsetHeight;
      }

      setFontSize(nextSize);
    };

    adjustFontSize();

    const resizeObserver = new ResizeObserver(adjustFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", adjustFontSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", adjustFontSize);
    };
  }, [displayText]);

  // テンキー入力処理
  const handleNumClick = (num: string) => {
    // 小数点入力の制御
    if (num === ".") {
      if (config.decimals === 0) return;
      if (!amount) {
        setAmount("0.");
        return;
      }
      if (amount.includes(".")) return;

      setAmount((prev) => `${prev}.`);
      return;
    }

    // 数字入力の整形（先頭0の扱いを含む）
    setAmount((prev) => {
      const [intPart = "", decimalPart] = prev.split(".");
      const hasDecimal = decimalPart !== undefined;

      if (hasDecimal) {
        if (decimalPart.length >= config.decimals) return prev;
        return `${prev}${num}`;
      }

      if (intPart === "0") {
        if (num === "0") return prev; // 先頭の0は一つだけ残す
        return num; // 非0の数字が来たら先頭0を置き換える
      }

      if (intPart.length >= 9) return prev;

      return `${prev}${num}`;
    });
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleDeleteRecord = () => {
    if (!params?.id) return;
    
    const storedData = localStorage.getItem("kaimono_records");
    if (storedData) {
      const records = JSON.parse(storedData);
      const newRecords = records.filter((r: any) => r.id !== params.id);
      localStorage.setItem("kaimono_records", JSON.stringify(newRecords));
      toast.success("記録を削除しました");
      setLocation("/history");
    }
  };

  const handleSubmit = () => {
    // 金額が0または空の場合は削除確認
    if (!amount || parseFloat(amount) === 0) {
      if (isEditMode) {
        setShowDeleteConfirm(true);
      } else {
        toast.error(t("inputAmount"));
      }
      return;
    }

    const storedData = localStorage.getItem("kaimono_records");
    let records = storedData ? JSON.parse(storedData) : [];

    if (isEditMode && params?.id) {
      // 更新処理
      records = records.map((r: any) => {
        if (r.id === params.id) {
          return {
            ...r,
            amount: parseFloat(amount),
            categoryKey,
            note,
            // 日付は変更しない（必要なら編集可能にするが、今回は新規入力画面ベースなので維持）
            date: originalDate || r.date,
          };
        }
        return r;
      });
      
      localStorage.setItem("kaimono_records", JSON.stringify(records));
      toast.success("記録を更新しました");
      setLocation("/history");
    } else {
      // 新規作成処理
      const newRecord = {
        id: crypto.randomUUID(),
        amount: parseFloat(amount),
        categoryKey, // 翻訳済み文字列ではなくキーを保存する
        note,
        date: new Date().toISOString(),
        currency: config.code, // 記録時の通貨を保存
      };
      
      localStorage.setItem("kaimono_records", JSON.stringify([newRecord, ...records]));

      // ボタン内フィードバックを表示
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1000);
      
      setAmount("");
      setNote("");
    }
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
      
      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase">記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-muted-foreground">
              金額が0になっています。この記録を削除してもよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-black dark:border-white rounded-none font-bold hover:bg-accent hover:text-accent-foreground">キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-destructive text-destructive-foreground border-2 border-black dark:border-white rounded-none font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all">削除する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header - Minimal & Accessible */}
      <header className={`flex justify-between items-center px-4 py-3 border-b-2 border-black dark:border-white shrink-0 z-20 transition-colors ${isEditMode ? "bg-destructive text-destructive-foreground" : "bg-white dark:bg-black"}`}>
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <div className="flex items-center gap-2 w-full justify-center relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation("/history")}
                className="absolute left-0 w-8 h-8 rounded-none border-2 border-black dark:border-white hover:bg-black/10 hover:text-destructive-foreground transition-all active:translate-y-1"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={3} />
              </Button>
              <h1 className="text-lg font-black tracking-tighter uppercase ml-10">EDIT RECORD</h1>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
              </div>
              <h1 className="text-lg font-black tracking-tighter uppercase">SAKUKIRO</h1>
            </div>
          )}
          
          {!isEditMode && (
            <button
              onClick={() => setIsHelpOpen(true)}
              className="w-8 h-8 flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-accent transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none"
              aria-label="Help"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
        </div>

        {!isEditMode && (
          <div className="flex items-center gap-2">
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
        )}
        
        {isEditMode && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 rounded-none border-2 border-black dark:border-white hover:bg-black/10 hover:text-destructive-foreground transition-all active:translate-y-1 text-destructive-foreground"
          >
            <Trash2 className="w-5 h-5" strokeWidth={2.5} />
          </Button>
        )}
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
              className="neo-input h-24 flex items-center bg-white dark:bg-black transition-all group-focus-within:shadow-[6px_6px_0px_0px_var(--color-safety-orange)] px-4 py-0 relative gap-2"
            >
              {/* Currency Info - Fixed Width Area */}
              <div className="flex flex-col items-center justify-center w-12 shrink-0 pointer-events-none select-none">
                <span className="text-3xl font-bold text-muted-foreground leading-none">{getSymbol()}</span>
                <span className="text-[9px] font-black text-muted-foreground/50 tracking-widest mt-0.5">{config.code}</span>
              </div>

              {/* Amount - Flexible Area with Auto-Scaling Font */}
              <div ref={containerRef} className="flex-1 flex items-center justify-end min-w-0 overflow-hidden h-full">
                <span 
                  ref={spanRef}
                  className={`inline-flex items-center justify-end font-bold tracking-tighter text-right h-full px-1 whitespace-nowrap ${amount ? "text-foreground" : "text-muted-foreground/20"}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {displayText}
                </span>
              </div>
              
              {/* Clear Button - Fixed Width Area */}
              <div className="w-10 flex items-center justify-center shrink-0">
                {amount && (
                  <button 
                    onClick={handleClear}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/20"
                  >
                    <X className="w-6 h-6" strokeWidth={3} />
                  </button>
                )}
              </div>
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
                className="w-full text-base font-bold px-3 py-0 border-2 border-black dark:border-white rounded-none shadow-none focus-visible:ring-0 focus:shadow-[4px_4px_0px_0px_var(--color-safety-orange)] transition-all bg-white dark:bg-black box-border"
                style={{ height: '56px' }}
              />
            </div>
          </div>
        </div>

        {/* Keypad Area - Maximized for Fitts's Law */}
        <div className="flex-1 grid grid-cols-4 gap-0 p-0 mt-2 border-t-2 border-black dark:border-white bg-white dark:bg-black">
          {/* Main Numbers 1-9 */}
          <div className="col-span-3 grid grid-cols-3 grid-rows-4">
            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num)}
                className="h-full w-full text-3xl font-black border-r-2 border-b-2 border-black dark:border-white active:bg-accent active:text-accent-foreground transition-colors flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            {/* Bottom Row: 0, ., Delete */}
            <button
              onClick={() => handleNumClick("0")}
              className="col-span-2 h-full w-full text-3xl font-black border-r-2 border-b-2 border-black dark:border-white active:bg-accent active:text-accent-foreground transition-colors flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={() => handleNumClick(".")}
              className="h-full w-full text-3xl font-black border-r-2 border-b-2 border-black dark:border-white active:bg-accent active:text-accent-foreground transition-colors flex items-center justify-center pb-2"
            >
              .
            </button>
          </div>

          {/* Right Column: Delete & Submit */}
          <div className="col-span-1 grid grid-rows-2">
            <button
              onClick={handleDelete}
              className="h-full w-full border-b-2 border-black dark:border-white bg-muted/30 active:bg-destructive active:text-destructive-foreground transition-colors flex items-center justify-center"
            >
              <Delete className="w-8 h-8" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleSubmit}
              className={`h-full w-full flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden ${
                isSaved 
                  ? "bg-green-500 text-white" 
                  : "bg-primary text-primary-foreground active:opacity-90"
              }`}
            >
              <AnimatePresence mode="wait">
                {isSaved ? (
                  <motion.div
                    key="saved"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <Check className="w-10 h-10" strokeWidth={4} />
                    <span className="text-xs font-black uppercase tracking-widest">SAVED</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="submit"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xl font-black uppercase tracking-widest">{isEditMode ? "UPDATE" : "ENTER"}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
