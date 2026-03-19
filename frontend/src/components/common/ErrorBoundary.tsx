import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获 React 组件树中的 JavaScript 错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理回调
    this.props.onError?.(error, errorInfo);

    // 记录错误日志
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 可以在这里发送错误到监控服务
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { hasError } = this.state;
    const { resetKeys } = this.props;

    // 如果提供了 resetKeys，当它们变化时重置错误状态
    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  reportError(error: Error, errorInfo: ErrorInfo) {
    // 可以集成 Sentry、LogRocket 等错误监控服务

    if (
      typeof window !== 'undefined' &&
      (
        window as unknown as {
          Sentry?: {
            captureException: (e: Error, opts: { extra: { componentStack: string } }) => void;
          };
        }
      ).Sentry
    ) {
      (
        window as unknown as {
          Sentry: {
            captureException: (e: Error, opts: { extra: { componentStack: string } }) => void;
          };
        }
      ).Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 如果提供了自定义 fallback，使用它
      if (fallback) {
        return fallback;
      }

      // 默认错误 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">出错了</h1>
              <p className="text-muted-foreground">抱歉，应用程序遇到了意外错误</p>
            </div>

            {error && (
              <div className="bg-muted rounded-lg p-4 text-left overflow-auto max-h-48">
                <p className="text-sm font-mono text-destructive">{error.toString()}</p>
                {errorInfo && (
                  <pre className="text-xs text-muted-foreground mt-2 overflow-auto">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.resetErrorBoundary} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                重试
              </Button>
              <Button onClick={this.handleReload} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                刷新页面
              </Button>
              <Button onClick={this.handleGoHome} variant="ghost" className="gap-2">
                <Home className="w-4 h-4" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * 小型错误边界 - 用于局部错误处理
 */
interface MiniErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export const MiniErrorBoundary: React.FC<MiniErrorBoundaryProps> = ({
  children,
  fallback,
  onReset,
}) => {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">组件加载失败</span>
            </div>
            <Button size="sm" variant="outline" onClick={onReset} className="gap-1">
              <RefreshCw className="w-3 h-3" />
              重试
            </Button>
          </div>
        )
      }
      onError={error => {
        console.error('MiniErrorBoundary caught error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
