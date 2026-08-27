import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Unhandled React Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-surface-subtle/50 rounded-3xl border border-border-subtle my-6 animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 shadow-inner">
                        <AlertTriangle size={32} />
                    </div>

                    <h2 className="text-xl font-black text-foreground tracking-wide mb-2">
                        {this.props.fallbackTitle || 'Something went wrong'}
                    </h2>

                    <p className="text-sm font-medium text-muted max-w-md mb-6 leading-relaxed">
                        An unexpected error occurred in this module. You can reload the page or click retry below to attempt recovery.
                    </p>

                    {this.state.error && (
                        <div className="mb-6 p-4 rounded-xl bg-background/80 border border-border-subtle text-left max-w-lg w-full font-mono text-xs text-red-400 overflow-x-auto">
                            <p className="font-bold mb-1">{this.state.error.toString()}</p>
                            {this.state.errorInfo?.componentStack && (
                                <pre className="text-[10px] text-muted opacity-80 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                                </pre>
                            )}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg cursor-pointer"
                    >
                        <RefreshCw size={16} />
                        <span>Reload Application</span>
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
