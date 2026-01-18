import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { History, ShoppingBag, Delete, Check } from "lucide-react";
import { toast } from "sonner";

// UX_RATIONALE:
// - jacob_law: テンキー配置は一般的な電卓や電話のUIを踏襲し、学習コストを下げる。
// - fitts_law: 頻繁に押す数字キーと確定ボタンを大きく配置し、操作ミスを減らす。
// - peak_end_rule: 入力完了時に明確なフィードバック（トースト通知と画面リセット）を行い、達成感を与える。
// - data_entry_placeholder: 金額入力の初期値は空文字とし、プレースホルダーで「0」を表示する。

const CATEGORIES = [
  "食費",
  "日用品",
  "交通費",
  "娯楽",
  "衣服",
  "医療",
  "その他"
];

export default function Home() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [_, setLocation] = useLocation();

  // テンキー入力処理
  const handleNumClick = (num: string) => {
    if (amount.length >= 7) return; // 桁数制限
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
      toast.error("金額を入力してください");
      return;
    }

    const newRecord = {
      id: crypto.randomUUID(),
      amount: parseInt(amount, 10),
      category,
      note,
      date: new Date().toISOString(),
    };

    // ローカルストレージに保存
    const storedData = localStorage.getItem("kaimono_records");
    const records = storedData ? JSON.parse(storedData) : [];
    localStorage.setItem("kaimono_records", JSON.stringify([newRecord, ...records]));

    toast.success("記録しました！");
    
    // リセット
    setAmount("");
    setNote("");
    // カテゴリは前回値を保持するかリセットするか選択の余地があるが、連続入力を考慮して保持する
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b-4 border-black dark:border-white bg-white dark:bg-black z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase">Kaimono</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/history")}
          className="hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-black dark:hover:border-white transition-all"
        >
          <History className="w-6 h-6" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 gap-4">
        {/* Display Area */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <div className="absolute top-2 left-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</div>
            <div className="neo-input h-24 flex items-end justify-end text-5xl tracking-tighter overflow-hidden">
              <span className="text-2xl mr-1 self-end mb-2">¥</span>
              {amount || <span className="text-muted-foreground/30">0</span>}
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="neo-input h-12 w-full text-base">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-bold focus:bg-accent focus:text-accent-foreground cursor-pointer">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest">Note</label>
            <Input 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              placeholder="Store name, etc." 
              className="neo-input h-12 text-base placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Keypad */}
        <div className="flex-1 grid grid-cols-3 gap-3 mt-2">
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="neo-btn bg-white dark:bg-black text-2xl hover:bg-gray-100 dark:hover:bg-gray-900 active:translate-y-1 active:shadow-none"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="neo-btn bg-muted text-muted-foreground text-lg hover:bg-muted/80 active:translate-y-1 active:shadow-none"
          >
            C
          </button>
          <button
            onClick={() => handleNumClick("0")}
            className="neo-btn bg-white dark:bg-black text-2xl hover:bg-gray-100 dark:hover:bg-gray-900 active:translate-y-1 active:shadow-none"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="neo-btn bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 active:translate-y-1 active:shadow-none"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          className="h-16 text-xl font-black uppercase tracking-widest border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all bg-primary text-primary-foreground hover:bg-primary/90 w-full mt-2"
        >
          Confirm <Check className="ml-2 w-6 h-6" strokeWidth={3} />
        </Button>
      </main>
    </div>
  );
}
