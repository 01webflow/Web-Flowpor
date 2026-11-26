import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WebFlow Creative Studio render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B1A] text-[#F5F7FF] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/12 bg-[#10152B] p-8 text-center space-y-5 shadow-2xl">
            <p className="text-xs font-mono uppercase tracking-widest text-[#397BFF]">
              WebFlow Creative Studio
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Something interrupted the experience.
            </h1>
            <p className="text-sm text-[#A2A9C3] leading-relaxed">
              Please reload the page to restore the portfolio workspace.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#397BFF] hover:bg-[#2B66E0] text-sm font-semibold text-white transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
