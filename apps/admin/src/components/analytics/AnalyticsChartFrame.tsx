'use client';

import { useEffect, useState, type ReactElement } from 'react';

import { ResponsiveContainer } from 'recharts';

type AnalyticsChartFrameProps = {
  height?: number;
  className?: string;
  children: ReactElement;
};

export function AnalyticsChartFrame({
  height = 256,
  className = 'mt-4',
  children,
}: AnalyticsChartFrameProps): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className={`w-full min-w-0 ${className}`} style={{ height }}>
      {ready ? (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
