import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Log the technical error for debugging
      console.error('[ErrorBoundary] Technical error:', this.state.error);
      return (
        <div className="flex h-screen items-center justify-center bg-brand-bg text-white">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-brand-text-secondary text-sm mb-4">
              Something went wrong. Please reload the app.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-primary rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}