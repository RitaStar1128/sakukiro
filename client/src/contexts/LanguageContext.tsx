import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ja" | "en";

interface Translations {
  [key: string]: {
    ja: string;
    en: string;
  };
}

const translations: Translations = {
  amount: { ja: "金額", en: "AMOUNT" },
  category: { ja: "カテゴリ", en: "CATEGORY" },
  note: { ja: "備考", en: "NOTE" },
  notePlaceholder: { ja: "店名、品名など...", en: "Store, item..." },
  confirm: { ja: "記録する", en: "CONFIRM" },
  history: { ja: "履歴", en: "HISTORY" },
  noRecords: { ja: "記録がありません", en: "NO RECORDS" },
  delete: { ja: "削除しました", en: "Deleted" },
  saved: { ja: "記録しました！", en: "Saved!" },
  inputAmount: { ja: "金額を入力してください", en: "Please enter amount" },
  warningTitle: { ja: "注意：データは端末に保存されます", en: "Caution: Data is saved locally" },
  warningDesc: { ja: "ブラウザの履歴やキャッシュを削除すると、記録も消去されます。", en: "Clearing browser cache/history will delete your records." },
  
  // Categories
  cat_food: { ja: "食費", en: "Food" },
  cat_daily: { ja: "日用品", en: "Daily" },
  cat_transport: { ja: "交通費", en: "Transport" },
  cat_entertainment: { ja: "娯楽", en: "Fun" },
  cat_clothing: { ja: "衣服", en: "Clothes" },
  cat_medical: { ja: "医療", en: "Medical" },
  cat_other: { ja: "その他", en: "Other" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  formatDate: (isoString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ja");

  useEffect(() => {
    const storedLang = localStorage.getItem("kaimono_language") as Language;
    if (storedLang) {
      setLanguage(storedLang);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.startsWith("ja") ? "ja" : "en";
      setLanguage(browserLang);
    }
  }, []);

  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("kaimono_language", lang);
  };

  const toggleLanguage = () => {
    const newLang = language === "ja" ? "en" : "ja";
    updateLanguage(newLang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    if (language === "ja") {
      return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, toggleLanguage, t, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
