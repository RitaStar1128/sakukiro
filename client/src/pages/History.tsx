import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

// UX_RATIONALE:
// - serial_position_effect: 最新の記録（最も重要）をリストの一番上に配置し、即座に確認できるようにする。
// - zeigarnik_effect: 削除操作は不可逆であるため、確認ダイアログ（または明確なアクション）を通じて完了させるが、今回はスピード重視で即時削除＋Undoトーストを採用し、心理的負担を減らす。
// - von_restorff_effect: 削除ボタンは赤色で目立たせ、誤操作を防ぐための視覚的な警告とする。

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
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center p-4 border-b-4 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/")}
          className="mr-2 hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-black dark:hover:border-white transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold tracking-tighter uppercase">History</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
            <ShoppingBag className="w-16 h-16 mb-4" />
            <p className="text-lg font-bold">No records yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="neo-border bg-white dark:bg-black p-4 flex justify-between items-center neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tighter">
                      ¥{record.amount.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold uppercase bg-accent text-accent-foreground px-2 py-0.5 border border-black dark:border-white">
                      {record.category}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatDate(record.date)}
                    </span>
                    {record.note && (
                      <span className="text-sm font-bold mt-1">
                        {record.note}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(record.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-2 border-transparent hover:border-black dark:hover:border-white transition-all ml-2"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
