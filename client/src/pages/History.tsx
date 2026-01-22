import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, ShoppingBag, AlertTriangle, X, Download, Edit2, Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency, CurrencyCode } from "@/contexts/CurrencyContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

// UX_RATIONALE:
// - serial_position_effect: リスト表示において、最新のアイテム（上部）を強調。
// - zeigarnik_effect: 削除時のアニメーション（スワイプアウトやフェードアウト）で、タスク完了（削除）を視覚的に明確にする。
// - von_restorff_effect: 各カードのデザインを統一しつつ、金額を大きく表示して視認性を高める。
// - haptic_feedback: スワイプ操作による直感的なインタラクションを提供。

interface Record {
  id: string;
  amount: number;
  categoryKey?: string;
  category?: string;
  note: string;
  date: string;
  currency?: CurrencyCode;
}

// Swipeable Item Component
function HistoryItem({ 
  record, 
  index, 
  onDelete, 
  onEdit,
  t, 
  formatDate, 
  availableCurrencies 
}: { 
  record: Record; 
  index: number; 
  onDelete: (id: string) => void; 
  onEdit: (record: Record) => void;
  t: (key: string) => string; 
  formatDate: (date: string) => string;
  availableCurrencies: any;
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [0, 1, 1]);
  const bgOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(record.id);
    } else {
      // Reset position if not swiped far enough
      // Framer Motion handles the spring back automatically via dragConstraints
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative mb-3"
    >
      {/* Background Layer (Delete Action) */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-destructive flex items-center justify-end px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        <Trash2 className="w-6 h-6 text-destructive-foreground" strokeWidth={2.5} />
      </motion.div>

      {/* Foreground Layer (Content) */}
      <motion.div
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.05 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02, cursor: "grabbing" }}
        onClick={() => onEdit(record)}
        className="relative neo-border bg-white dark:bg-black p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] touch-pan-y cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex flex-col gap-1 overflow-hidden pointer-events-none select-none">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tighter">
              {(() => {
                const currencyCode = record.currency || "JPY";
                const currencyConfig = availableCurrencies[currencyCode] || availableCurrencies["JPY"];
                
                return new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: currencyCode,
                  minimumFractionDigits: currencyConfig.decimals,
                  maximumFractionDigits: currencyConfig.decimals,
                }).format(record.amount);
              })()}
            </span>
            <span className="text-[10px] font-black uppercase bg-primary text-primary-foreground px-1.5 py-0.5 border border-black dark:border-white">
              {record.categoryKey ? t(record.categoryKey) : record.category}
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
        
        {/* Visual indicator for swipe/edit */}
        <div className="flex flex-col items-end gap-2 pl-2 text-muted-foreground/20">
          <Edit2 className="w-4 h-4" strokeWidth={3} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { t, formatDate } = useLanguage();
  const { availableCurrencies } = useCurrency();
  const [records, setRecords] = useState<Record[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [_, setLocation] = useLocation();
  
  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("kaimono_records");
    if (storedData) {
      setRecords(JSON.parse(storedData));
    }

    const warningDismissed = localStorage.getItem("kaimono_warning_dismissed");
    if (!warningDismissed) {
      setShowWarning(true);
    }
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    localStorage.setItem("kaimono_warning_dismissed", "true");
  };

  const handleDelete = (id: string) => {
    const newRecords = records.filter((r) => r.id !== id);
    setRecords(newRecords);
    localStorage.setItem("kaimono_records", JSON.stringify(newRecords));
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error(t("noRecords"));
      return;
    }

    const headers = ["Date", "Amount", "Currency", "Category", "Note"];
    const rows = records.map(record => {
      const date = new Date(record.date).toLocaleString();
      const category = record.categoryKey ? t(record.categoryKey) : record.category;
      const note = record.note ? `"${record.note.replace(/"/g, '""')}"` : "";
      
      return [
        date,
        record.amount,
        record.currency || "JPY",
        category,
        note
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kaimono_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Edit Handlers
  const openEditModal = (record: Record) => {
    setEditingRecord(record);
    setEditAmount(record.amount.toString());
    setEditCategory(record.categoryKey || "others");
    setEditNote(record.note || "");
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    try {
      const dateObj = new Date(record.date);
      const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setEditDate(localDate);
    } catch (e) {
      setEditDate(new Date().toISOString().slice(0, 16));
    }
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("invalidAmount"));
      return;
    }

    const updatedRecord: Record = {
      ...editingRecord,
      amount: amount,
      categoryKey: editCategory,
      category: t(editCategory), // Fallback for older structure
      note: editNote,
      date: new Date(editDate).toISOString()
    };

    const newRecords = records.map(r => r.id === editingRecord.id ? updatedRecord : r);
    
    // Sort by date descending
    newRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setRecords(newRecords);
    localStorage.setItem("kaimono_records", JSON.stringify(newRecords));
    setEditingRecord(null);
    toast.success(t("saved"));
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const categories = [
    "food",
    "daily",
    "transport",
    "entertainment",
    "clothing",
    "medical",
    "education",
    "utilities",
    "others"
  ];

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
          className="mr-2 w-10 h-10 rounded-none border-2 border-black dark:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-x-[-2px]"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
        </Button>
        <h1 className="text-lg font-black tracking-tighter uppercase flex-1">{t("history")}</h1>
        {records.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExportCSV}
            className="w-10 h-10 rounded-none border-2 border-black dark:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-y-1"
            title="Export CSV"
          >
            <Download className="w-6 h-6" strokeWidth={2.5} />
          </Button>
        )}
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 overflow-x-hidden">
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="neo-border bg-yellow-300 dark:bg-yellow-600 p-3 flex gap-3 items-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="flex-1 text-sm font-bold leading-tight">
                <p className="mb-1">{t("warningTitle")}</p>
                <p className="text-xs opacity-80 font-normal">{t("warningDesc")}</p>
              </div>
              <button 
                onClick={dismissWarning}
                className="shrink-0 p-1 hover:bg-black/10 rounded-sm transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground opacity-50">
            <ShoppingBag className="w-16 h-16 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-bold tracking-widest uppercase">{t("noRecords")}</p>
          </div>
        ) : (
          <div className="flex flex-col pb-8">
            <AnimatePresence mode="popLayout">
              {records.map((record, index) => (
                <HistoryItem 
                  key={record.id} 
                  record={record} 
                  index={index} 
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  t={t}
                  formatDate={formatDate}
                  availableCurrencies={availableCurrencies}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="neo-border bg-background sm:max-w-[425px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              {t("editRecord")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-bold uppercase text-xs text-muted-foreground">{t("amount")}</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="text-right font-mono text-lg font-bold pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                  {editingRecord?.currency || "JPY"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-bold uppercase text-xs text-muted-foreground">{t("category")}</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-bold">
                      {t(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="font-bold uppercase text-xs text-muted-foreground">{t("date")}</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="font-bold uppercase text-xs text-muted-foreground">{t("note")}</Label>
              <Textarea
                id="note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="font-bold resize-none min-h-[80px]"
                placeholder={t("notePlaceholder")}
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-muted/20 flex-row gap-2 justify-end border-t-2 border-black dark:border-white">
            <Button variant="outline" onClick={() => setEditingRecord(null)} className="flex-1 font-bold border-2">
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} className="flex-1 font-bold border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:shadow-none transition-all">
              <Save className="w-4 h-4 mr-2" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
