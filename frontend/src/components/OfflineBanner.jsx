import { useLocale } from "../hooks/useLocale";

const bannerClass = "fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center py-2 text-sm font-medium";

function OfflineBanner() {
  const { t } = useLocale();
  return <div className={bannerClass}>{t("app.offline")}</div>;
}

export default OfflineBanner;