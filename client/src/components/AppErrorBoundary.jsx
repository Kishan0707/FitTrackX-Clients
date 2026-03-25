import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
          <div className="w-full max-w-3xl rounded-xl border border-red-500/25 bg-slate-900 p-6 shadow-lg">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-300">
              Debug Mode
            </p>
            <h1 className="mb-3 text-2xl font-bold">A render error was caught</h1>
            <p className="mb-4 text-sm text-slate-300">
              The app hit a React render crash. The details below should help us
              pinpoint the broken field or component.
            </p>

            <div className="mb-4 rounded-lg border border-slate-700 bg-slate-950 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                Error
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-red-200">
                {this.state.error?.stack || this.state.error?.message || "Unknown error"}
              </pre>
            </div>

            <div className="mb-5 rounded-lg border border-slate-700 bg-slate-950 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                Component Stack
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-200">
                {this.state.errorInfo?.componentStack || "No component stack available"}
              </pre>
            </div>

            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
