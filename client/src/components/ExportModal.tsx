import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileSpreadsheet, Table } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// UX_RATIONALE:
// - confirmation_bias: ユーザーがエクスポートを実行する前に、その内容と形式を確認させることで、期待通りの結果が得られるという確信を与える。
// - mental_model: Excelやスプレッドシートのアイコンを使用し、ユーザーが既存の知識（メンタルモデル）を利用して機能を理解しやすくする。

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExportModal({ isOpen, onClose, onConfirm }: ExportModalProps) {
  const { language } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="neo-border bg-background p-0 gap-0 max-w-sm w-[90vw] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] border-2 border-black dark:border-white sm:rounded-none">
        <DialogHeader className="p-4 border-b-2 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-10 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <Download className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter transform translate-y-[1px]">
              {language === 'ja' ? 'データ出力' : 'Export Data'}
            </DialogTitle>
          </div>
          <DialogClose asChild>
            <button 
              className="w-10 h-10 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all active:bg-destructive/90"
            >
              <X className="w-6 h-6" strokeWidth={4} />
            </button>
          </DialogClose>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted border-2 border-black dark:border-white">
              <FileSpreadsheet className="w-8 h-8 shrink-0" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-lg mb-1">CSV Format</h4>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {language === 'ja' 
                    ? 'ExcelやGoogleスプレッドシートで開けるCSV形式で出力します。' 
                    : 'Export in CSV format compatible with Excel and Google Sheets.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                <Table className="w-4 h-4" />
                {language === 'ja' ? 'データ構造' : 'Data Structure'}
              </h4>
              <div className="bg-black dark:bg-white text-white dark:text-black p-3 font-mono text-xs overflow-x-auto border-2 border-black dark:border-white">
                id, date, amount, category, note
              </div>
              <p className="text-xs font-bold text-muted-foreground">
                {language === 'ja'
                  ? '※ 日付は YYYY-MM-DD 形式で出力されます。'
                  : '* Dates are formatted as YYYY-MM-DD.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-black uppercase tracking-wider text-sm">
                {language === 'ja' ? '活用方法' : 'How to Use'}
              </h4>
              <ul className="list-disc list-inside text-sm font-medium space-y-1 text-muted-foreground">
                <li>{language === 'ja' ? 'PCでの詳細な分析' : 'Detailed analysis on PC'}</li>
                <li>{language === 'ja' ? '月ごとの集計・グラフ作成' : 'Monthly aggregation & graphing'}</li>
                <li>{language === 'ja' ? 'データのバックアップ' : 'Data backup'}</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={onConfirm}
            className="w-full font-black text-base py-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {language === 'ja' ? 'エクスポートを実行' : 'Export Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
