import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (needRefresh) {
      console.log("New content available, show reload prompt");
    }
  }, [needRefresh]);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-start gap-4 rounded-none border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] md:left-auto md:right-4 md:w-96">
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg leading-tight text-black dark:text-white">
            UPDATE AVAILABLE
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            新しいバージョンが利用可能です。更新して最新機能をご利用ください。
          </p>
        </div>
        <button
          onClick={close}
          className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="flex w-full gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex-1 border-2 border-black bg-[#ff5e00] px-4 py-2 font-bold text-white transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:border-white"
        >
          UPDATE NOW
        </button>
      </div>
    </div>
  );
}
