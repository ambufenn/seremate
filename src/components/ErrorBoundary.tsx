import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let displayDetail = 'Something interrupted this view. Please refresh or return to the dashboard.';
      try {
        const parsed = JSON.parse(this.state.errorMessage) as { error?: string };
        if (parsed.error) {
          displayDetail = parsed.error;
        }
      } catch {
        if (this.state.errorMessage) {
          displayDetail = this.state.errorMessage;
        }
      }

      return (
        <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#FDFBF7] border border-[#231F1D]/12 rounded-3xl p-8 space-y-4">
            <p className="text-xs font-semibold text-[#C65D3B]">SereMate Recovery</p>
            <h1 className="font-display text-2xl font-semibold text-[#231F1D]">
              We hit an unexpected pause
            </h1>
            <p className="text-sm text-[#5E5650] leading-relaxed break-words">
              {displayDetail}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#C65D3B] hover:bg-[#AE4D2E] text-white text-sm font-semibold transition-colors"
            >
              Reload SereMate
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
