import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-accent-tomato/10 text-accent-tomato">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-medium text-ink">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-ink-mute">
            {this.state.error?.message ||
              'An unexpected application error occurred. Please refresh the page.'}
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Application</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
