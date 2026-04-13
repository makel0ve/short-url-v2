import { useLocale } from "../hooks/useLocale";

const containerClass = "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center";
const toastBaseClass = "flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg animate-fade-in";
const successClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
const errorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
const warningClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
const undoButtonClass = "ml-2 rounded-md bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-800 dark:hover:bg-yellow-700 px-3 py-1 text-xs font-semibold transition";

const typeClasses = {
  success: successClass,
  error: errorClass,
  warning: warningClass,
};

function ToastContainer({ toasts, onUndo }) {
  const { t } = useLocale();

  if (toasts.length === 0) return null;

  return (
    <div className={containerClass}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${toastBaseClass} ${typeClasses[toast.type] || successClass}`}>
          <span>{t(toast.messageKey)}</span>
          {toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo();
                onUndo(toast.id);
              }}
              className={undoButtonClass}
            >
              {t("toast.undo")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;