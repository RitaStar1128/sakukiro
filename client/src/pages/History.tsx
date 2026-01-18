import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// UX_RATIONALE:
// - serial_position_effect: リスト表示において、最新のアイテム（上部）を強調。
// - zeigarnik_effect: 削除時のアニメーション（スワイプアウトやフェードアウト）で、タスク完了（削除）を視覚的に明確にする。
// - von_restorff_effect: 各カードのデザインを統一しつつ、金額を大きく表示して視認性を高める。

interface Record {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const storedData = localStorage.getItem("kaimono_records");
    if (storedData) {
      setRecords(JSON.parse(storedData));
    }
  }, []);

  const handleDelete = (id: string) => {
    const newRecords = records.filter((r) => r.id !== id);
    setRecords(newRecords);
    localStorage.setItem("kaimono_records", JSON.stringify(newRecords));
    toast.success("削除しました");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex flex-col bg-background text-foreground font-sans"
    >
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b-2 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/")}
          className="mr-2 w-10 h-10 rounded-none border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-x-[-2px]"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
        </Button>
        <h1 className="text-lg font-black tracking-tighter uppercase">History</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground opacity-50">
            <ShoppingBag className="w-16 h-16 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-bold tracking-widest uppercase">No records</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            <AnimatePresence>
              {records.map((record, index) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="neo-border bg-white dark:bg-black p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tighter">
                        ¥{record.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-primary text-primary-foreground px-1.5 py-0.5 border border-black dark:border-white">
                        {record.category}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {formatDate(record.date)}
                      </span>
                      {record.note && (
                        <span className="text-sm font-bold mt-1 truncate">
                          {record.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(record.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none w-10 h-10 ml-2 shrink-0 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </motion.div>
  );
}
