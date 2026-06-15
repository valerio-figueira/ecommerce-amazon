'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { BlockErrorFallback } from '@/components/errors/BlockErrorFallback';

type BlockErrorBoundaryProps = {
  blockId: string;
  blockType: string;
  children: ReactNode;
};

type BlockErrorBoundaryState = {
  hasError: boolean;
};

export class BlockErrorBoundary extends Component<BlockErrorBoundaryProps, BlockErrorBoundaryState> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): BlockErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console -- dev-only error logging
      console.error(
        `[BlockErrorBoundary] block=${this.props.blockId} type=${this.props.blockType}`,
        error,
        errorInfo,
      );
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return <BlockErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
