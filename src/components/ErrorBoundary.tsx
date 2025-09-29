import React from 'react';

type Props = { children?: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error?.message || error) };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error('UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h2 className="text-red-700 dark:text-red-300 font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-red-700/80 dark:text-red-300/80 break-all">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}


