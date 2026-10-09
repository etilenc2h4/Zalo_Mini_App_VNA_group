import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-stone-900 mb-2">
            Đã xảy ra sự cố hiển thị
          </h2>
          <p className="text-xs text-stone-600 max-w-xs mb-4 leading-relaxed">
            Ứng dụng gặp vấn đề trong quá trình khởi tạo dữ liệu. Vui lòng tải lại trang.
          </p>

          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-2xl bg-[#ff9600] text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tải lại ứng dụng</span>
          </button>

          {this.state.error && (
            <div className="mt-6 p-3 bg-stone-100 rounded-xl text-left max-w-sm w-full overflow-auto text-[10px] text-red-800 font-mono">
              <p className="font-bold">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

