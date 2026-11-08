import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Vitality App Error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbfbf9] text-stone-800 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-1">Something went wrong</h2>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              An unexpected error occurred while starting Vitality.
            </p>
            {this.state.error?.message && (
              <div className="text-left bg-stone-50 border border-stone-200 rounded-xl p-3 mb-5 font-mono text-[11px] text-stone-700 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

