import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DONATION_PRODUCTS } from "../../../shared/products";
import { toast } from "sonner";

export function DonationModal() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDonation = async (productId: string) => {
    try {
      setIsLoading(productId);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error(language === "ja" ? "決済の開始に失敗しました" : "Failed to start checkout");
      setIsLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 rounded-none border-2 border-black dark:border-white hover:bg-accent hover:text-accent-foreground transition-all active:translate-y-1"
        >
          <Coffee className="w-6 h-6" strokeWidth={2.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className="neo-border bg-background p-0 gap-0 max-w-sm w-[90vw] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] border-2 border-black dark:border-white sm:rounded-none">
        <DialogHeader className="p-4 border-b-2 border-black dark:border-white bg-accent">
          <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            {language === "ja" ? "開発者を支援" : "Support Dev"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {language === "ja" ? "開発者を支援するための寄付オプションを選択してください" : "Choose a donation option to support the developer"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <p className="text-sm font-bold text-muted-foreground mb-4">
            {language === "ja" 
              ? "もしこのアプリを気に入っていただけたら、コーヒーを一杯ご馳走していただけると嬉しいです！開発の励みになります。" 
              : "If you enjoy using this app, please consider buying me a coffee! It helps keep the development going."}
          </p>

          <div className="space-y-3">
            {DONATION_PRODUCTS.map((product) => (
              <button
                key={product.id}
                onClick={() => handleDonation(product.id)}
                disabled={isLoading !== null}
                className="w-full neo-border p-4 flex items-center justify-between bg-background hover:bg-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.emoji}</span>
                  <div className="text-left">
                    <div className="font-black text-sm uppercase">{product.name}</div>
                    <div className="text-xs font-bold text-muted-foreground">
                      ¥{product.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                {isLoading === product.id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black dark:border-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
