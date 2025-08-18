'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = '#f4978e',
  height = 60,
  className,
}: SparklineProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id='sparklineGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type='monotone'
            dataKey='value'
            stroke={color}
            strokeWidth={2}
            fill='url(#sparklineGradient)'
            dot={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className='bg-base-200 border border-base-300 rounded-lg p-2 shadow-lg'>
                    <p className='text-sm font-medium'>{payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
