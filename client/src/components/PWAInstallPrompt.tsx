import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Share, PlusSquare, MoreVertical, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

// UX_RATIONALE:
// - progressive_disclosure: ユーザーの環境（PC/スマホブラウザ/PWA）に応じて必要な情報のみを表示。
// - social_proof: 「ホーム画面に追加」の手順を具体的に示すことで、ユーザーの行動を促す。
// - fitts_law: モバイルでのバナーは画面下部に配置し、親指でタップしやすい位置に。

export interface PWAInstallPromptHandle {
  openModal: () => void;
}

export const PWAInstallPrompt = forwardRef<PWAInstallPromptHandle>((_, ref) => {
  const { t, language } = useLanguage();
  const [isPWA, setIsPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [forcePC, setForcePC] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: () => setShowModal(true)
  }));

  useEffect(() => {
    // Check if user has chosen to use PC version
    const storedForcePC = localStorage.getItem("kaimono_force_pc");
    if (storedForcePC === "true") {
      setForcePC(true);
    }

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');
    setIsPWA(isStandalone);

    // Check if mobile device
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    // Set current URL for QR code
    setCurrentUrl(window.location.href);

    // Show banner if mobile and not PWA, and NOT already dismissed
    if (mobileCheck && !isStandalone) {
      const hasDismissed = localStorage.getItem("kaimono_pwa_banner_dismissed");
      if (!hasDismissed) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("kaimono_pwa_banner_dismissed", "true");
  };

  if (isPWA) return null;

  // PC View: Show QR Code Overlay
  if (!isMobile && !forcePC) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-8 max-w-md w-full shadow-[8px_8px_0px_0px_var(--color-safety-orange)] text-center relative">
          <Smartphone className="w-12 h-12 mx-auto mb-4 text-primary" strokeWidth={2} />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
            {language === 'ja' ? 'スマホでの利用を推奨' : 'Mobile Recommended'}
          </h2>
          <p className="text-sm font-bold text-muted-foreground mb-6">
            {language === 'ja' 
              ? 'このアプリはスマートフォンでの利用に最適化されています。以下のQRコードを読み取ってアクセスしてください。' 
              : 'This app is optimized for mobile use. Scan the QR code below to access on your phone.'}
          </p>
          
          <div className="bg-white p-4 border-2 border-black inline-block mb-4">
            <QRCodeSVG value={currentUrl} size={180} />
          </div>
          
          <p className="text-xs font-mono text-muted-foreground break-all mb-6">
            {currentUrl}
          </p>

          <Button 
            variant="outline" 
            onClick={() => {
              setForcePC(true);
              localStorage.setItem("kaimono_force_pc", "true");
            }}
            className="w-full border-2 border-black dark:border-white hover:bg-accent font-bold"
          >
            {language === 'ja' ? 'PC版を利用する' : 'Continue on PC'}
          </Button>
        </div>
      </div>
    );
  }

  // Mobile View: Banner & Modal
  return (
    <>
      {/* Bottom Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-primary text-primary-foreground border-t-4 border-black dark:border-white p-4 pb-safe shadow-[0px_-4px_10px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between max-w-md mx-auto gap-4">
              <div className="flex-1">
                <p className="font-black text-sm uppercase tracking-wide mb-1">
                  {language === 'ja' ? 'アプリとして使う' : 'Install App'}
                </p>
                <p className="text-xs font-bold opacity-90 leading-tight">
                  {language === 'ja' 
                    ? 'ホーム画面に追加して、より快適に記録しましょう。' 
                    : 'Add to home screen for the best experience.'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  size="sm" 
                  onClick={() => {
                    setShowModal(true);
                    handleDismissBanner(); // バナーから開いた場合はバナーを閉じて次回から非表示
                  }}
                  className="bg-white text-black border-2 border-black hover:bg-gray-100 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none"
                >
                  {language === 'ja' ? '追加方法' : 'How to'}
                </Button>
                <button 
                  onClick={handleDismissBanner}
                  className="p-2 hover:bg-black/10 rounded-sm transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white dark:bg-black border-t-4 sm:border-4 border-black dark:border-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_0px_var(--color-safety-orange)] flex flex-col"
            >
              <div className="p-4 border-b-2 border-black dark:border-white flex justify-between items-center sticky top-0 bg-white dark:bg-black z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <Smartphone className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter transform translate-y-[1px]">
                    {language === 'ja' ? 'ホーム画面への追加' : 'Add to Home'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all active:bg-destructive/90"
                >
                  <X className="w-6 h-6" strokeWidth={4} />
                </button>
              </div>

              <div className="p-4">
                <Tabs defaultValue="ios" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 border-2 border-black dark:border-white p-1 bg-muted h-auto">
                    <TabsTrigger 
                      value="ios" 
                      className="font-bold py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-foreground data-[state=active]:border-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                    >
                      iPhone (iOS)
                    </TabsTrigger>
                    <TabsTrigger 
                      value="android" 
                      className="font-bold py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-foreground data-[state=active]:border-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                    >
                      Android
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ios" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                      <Step 
                        number={1} 
                        text={language === 'ja' ? 'Safariでこのページを開きます。' : 'Open this page in Safari.'} 
                        icon={<Monitor className="w-5 h-5" />}
                      />
                      <Step 
                        number={2} 
                        text={language === 'ja' ? '画面下部の「共有」ボタンをタップします。' : 'Tap the "Share" button at the bottom.'} 
                        icon={<Share className="w-5 h-5" />}
                      />
                      <Step 
                        number={3} 
                        text={language === 'ja' ? 'メニューをスクロールして「ホーム画面に追加」を選択します。' : 'Scroll down and select "Add to Home Screen".'} 
                        icon={<PlusSquare className="w-5 h-5" />}
                      />
                      <Step 
                        number={4} 
                        text={language === 'ja' ? '右上の「追加」をタップして完了です。' : 'Tap "Add" in the top right corner.'} 
                        isLast
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="android" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                      <Step 
                        number={1} 
                        text={language === 'ja' ? 'Chromeでこのページを開きます。' : 'Open this page in Chrome.'} 
                        icon={<Monitor className="w-5 h-5" />}
                      />
                      <Step 
                        number={2} 
                        text={language === 'ja' ? '右上のメニューアイコン（︙）をタップします。' : 'Tap the menu icon (︙) in the top right.'} 
                        icon={<MoreVertical className="w-5 h-5" />}
                      />
                      <Step 
                        number={3} 
                        text={language === 'ja' ? '「ホーム画面に追加」または「アプリをインストール」を選択します。' : 'Select "Add to Home screen" or "Install app".'} 
                        icon={<Smartphone className="w-5 h-5" />}
                      />
                      <Step 
                        number={4} 
                        text={language === 'ja' ? '確認画面で「追加」をタップして完了です。' : 'Tap "Add" to confirm.'} 
                        isLast
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

function Step({ number, text, icon, isLast = false }: { number: number, text: string, icon?: React.ReactNode, isLast?: boolean }) {
  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div className="absolute left-[15px] top-10 bottom-[-24px] w-0.5 bg-muted-foreground/30" />
      )}
      <div className="shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black font-black flex items-center justify-center z-10 border-2 border-black dark:border-white">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <p className="font-bold text-sm leading-relaxed">{text}</p>
        {icon && (
          <div className="mt-2 inline-flex items-center justify-center w-10 h-10 bg-muted rounded-sm border border-black/10 dark:border-white/10">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
