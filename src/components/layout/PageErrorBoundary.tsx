import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Page-level error boundary. Catches runtime errors from individual pages
 * and shows a clear error message instead of a blank screen.
 *
 * This is important because React 19's error handling can swallow render
 * errors in development, leaving pages blank. This boundary ensures the
 * user always sees what went wrong.
 */
export class PageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[PageErrorBoundary]', error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            This page hit an error
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Something went wrong while rendering this page. Try refreshing — if the
            issue persists, the console error below has the technical details.
          </p>
          {this.state.error && (
            <pre className="max-w-md overflow-x-auto rounded-md bg-secondary p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <Button variant="brand" onClick={this.handleReset}>
              Try Again
            </Button>
            <Button variant="outline" onClick={this.handleReload}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
