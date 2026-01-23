import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileSpreadsheet, Table } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { modalBodyClass, modalCloseButtonClass, modalContentClass, modalHeaderClass, modalIconBoxClass, modalTitleClass } from "@/components/modalStyles";

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
      <DialogContent className={modalContentClass}>
        <DialogHeader className={modalHeaderClass}>
          <div className="flex items-center gap-3">
            <div className={modalIconBoxClass}>
              <Download className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
            </div>
            <DialogTitle className={modalTitleClass}>
              {language === 'ja' ? 'データ出力' : 'Export Data'}
            </DialogTitle>
          </div>
          <DialogClose asChild>
            <button 
              className={modalCloseButtonClass}
            >
              <X className="w-6 h-6" strokeWidth={4} />
            </button>
          </DialogClose>
        </DialogHeader>
        
        <div className={`${modalBodyClass} p-6 space-y-6`}>
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
            className="w-full font-black text-base py-6 border-2 border-black dark:border-white  active:translate-y-[2px] active:translate-x-[2px]  transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {language === 'ja' ? 'エクスポートを実行' : 'Export Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
