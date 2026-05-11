import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; resetKey?: string }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Page error caught by ErrorBoundary:', error, info);
  }

  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 text-center space-y-3">
          <AlertTriangle size={40} className="mx-auto text-destructive" />
          <p className="font-semibold">কিছু একটা সমস্যা হয়েছে</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
