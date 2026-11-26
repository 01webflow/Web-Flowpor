import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Mail, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: 'fullscreen' | 'hero';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      componentStack: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[WebFlow Creative Studio] Client render error captured:', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });

    this.setState({
      error,
      componentStack: info.componentStack || null,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      componentStack: null,
      showDetails: false,
    });
  };

  render() {
    const { hasError, error, componentStack, showDetails } = this.state;
    const { children, variant = 'fullscreen' } = this.props;

    if (!hasError) {
      return children;
    }

    if (variant === 'hero') {
      return (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#EEF3FF] dark:bg-[#080B1A]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 72% 45%, rgba(57, 123, 255, 0.22), rgba(133, 85, 255, 0.14) 34%, transparent 66%)',
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#080B1A] text-[#F5F7FF] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Ambient Studio Lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              'radial-gradient(640px circle at 25% 20%, rgba(57, 123, 255, 0.16), transparent 60%), radial-gradient(560px circle at 80% 78%, rgba(133, 85, 255, 0.14), transparent 62%)',
          }}
        />

        <div className="relative z-10 max-w-lg w-full rounded-2xl border border-white/12 bg-[#10152B]/90 backdrop-blur-xl p-7 sm:p-9 shadow-2xl space-y-6">
          {/* Top Gradient Hairline */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#397BFF] to-[#8555FF]"
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#397BFF] to-[#8555FF] text-white font-display font-bold text-sm"
                aria-hidden="true"
              >
                W
              </span>
              <span className="font-display text-sm font-semibold tracking-tight text-[#F5F7FF]">
                WebFlow Creative Studio
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-mono-tabular text-[#397BFF]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Recovery Mode</span>
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FF]">
              Something interrupted the view.
            </h1>
            <p className="text-sm sm:text-base text-[#A2A9C3] leading-relaxed">
              A client-side component failed to initialize cleanly. You can retry loading the workspace or reload the page—our studio channels remain open below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#8555FF] hover:opacity-95 text-sm font-semibold text-white transition-opacity min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-white/15 bg-[#080B1A]/80 hover:border-[#397BFF] text-sm font-medium text-[#F5F7FF] transition-colors min-h-[44px]"
            >
              Try Recovering
            </button>

            <a
              href="mailto:01webflow@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#A2A9C3] hover:text-[#F5F7FF] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#397BFF]" />
              <span>01webflow@gmail.com</span>
            </a>
          </div>

          {error && (
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="inline-flex items-center gap-1.5 text-xs font-mono-tabular text-[#A2A9C3] hover:text-[#F5F7FF] transition-colors"
                aria-expanded={showDetails}
              >
                {showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>{showDetails ? 'Hide technical details' : 'View technical details'}</span>
              </button>

              {showDetails && (
                <pre className="mt-3 p-3.5 rounded-xl bg-[#080B1A] border border-white/10 text-xs font-mono-tabular text-[#A2A9C3] overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
                  {error.message || 'Unknown client rendering error'}
                  {componentStack ? `\n${componentStack.trim()}` : ''}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
