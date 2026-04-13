import { Component } from "react";
import { useLocale } from "../hooks/useLocale";

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{this.props.t("error.boundary.title")}</h1>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-white"
            >
              {this.props.t("error.boundary.reload")}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundary({ children }) {
  const { t } = useLocale();
  return <ErrorBoundaryClass t={t}>{children}</ErrorBoundaryClass>;
}

export default ErrorBoundary;