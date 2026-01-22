import { X, HelpCircle, Zap, CheckCircle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

// UX_RATIONALE:
// - mental_model: アプリの「思想」を最初に伝えることで、ユーザーに「なぜこのアプリを使うのか」という動機付けを行う。
// - chunking: 情報を「思想」と「使い方」に分割し、認知負荷を下げる。
// - visual_hierarchy: アイコンと太字を使って、重要なポイントを視覚的に強調する。

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { t, language } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-black border-4 border-black dark:border-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_var(--color-safety-orange)] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-black dark:border-white flex justify-between items-center sticky top-0 bg-white dark:bg-black z-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <HelpCircle className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter transform translate-y-[1px]">
                  {language === 'ja' ? 'サクキロについて' : 'About SAKUKIRO'}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all active:bg-destructive/90"
              >
                <X className="w-6 h-6" strokeWidth={4} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              
              {/* Philosophy Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-primary" strokeWidth={3} />
                  <h3 className="text-lg font-black uppercase tracking-wide border-b-4 border-primary inline-block leading-none pb-1">
                    {language === 'ja' ? 'アプリの思想' : 'Philosophy'}
                  </h3>
                </div>
                
                <p className="text-base font-bold leading-relaxed text-foreground/90">
                  {language === 'ja' 
                    ? '「サクキロ」は、その名の通り「サクッと支出記録」することを極限まで追求したアプリです。' 
                    : '"SAKUKIRO" is designed for one purpose: to track expenses with lightning speed.'}
                </p>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {language === 'ja'
                    ? 'アプリを開いた瞬間に記録が完了する体験を提供することで、「記録忘れ」という最大の課題を解決します。複雑な分析機能よりも、日々の入力の速さと心地よさを最優先に設計されています。'
                    : 'By enabling instant recording the moment you open the app, we solve the biggest problem: forgetting to track. We prioritize speed and comfort over complex analytics.'}
                </p>
              </section>

              {/* How to Use Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-primary" strokeWidth={3} />
                  <h3 className="text-lg font-black uppercase tracking-wide border-b-4 border-primary inline-block leading-none pb-1">
                    {language === 'ja' ? '使い方' : 'How to Use'}
                  </h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-xs border-2 border-black dark:border-white">1</span>
                    <div>
                      <p className="font-bold text-sm">{language === 'ja' ? '金額を入力' : 'Enter Amount'}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ja' ? 'アプリを開いたらすぐにテンキーで金額を入力します。' : 'Type the amount immediately using the keypad.'}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-xs border-2 border-black dark:border-white">2</span>
                    <div>
                      <p className="font-bold text-sm">{language === 'ja' ? 'カテゴリを選択（任意）' : 'Select Category (Optional)'}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ja' ? '必要であればカテゴリを選びます。デフォルトのままでもOK。' : 'Choose a category if needed. Default is fine too.'}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-xs border-2 border-black dark:border-white">3</span>
                    <div>
                      <p className="font-bold text-sm">{language === 'ja' ? '確定ボタンをタップ' : 'Tap Confirm'}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ja' ? 'これだけで記録完了。すぐに次の入力ができます。' : 'Done. You are ready for the next entry instantly.'}</p>
                    </div>
                  </li>
                </ul>
              </section>

              {/* Privacy Note */}
              <section className="bg-muted p-4 border-2 border-black/10 dark:border-white/10 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-bold uppercase text-muted-foreground">
                    {language === 'ja' ? 'データについて' : 'Data Privacy'}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === 'ja'
                    ? '入力されたデータは、お使いのブラウザ内にのみ保存されます。外部サーバーに送信されることはありません。'
                    : 'Your data is stored only within your browser. It is never sent to external servers.'}
                </p>
              </section>

            </div>
            


          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
