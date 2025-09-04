'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/mortgage-utils';

interface MarketData {
  month: string;
  price: number;
  rate: number;
}

interface MarketOverviewChartProps {
  data: MarketData[];
}

export function MarketOverviewChart({ data }: MarketOverviewChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.name === 'Median Price' 
                  ? formatCurrency(entry.value)
                  : `${entry.value.toFixed(2)}%`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Transform data for dual axis
  const chartData = data.map(item => ({
    ...item,
    // Scale rate for better visualization (multiply by 60000 to align with price scale)
    rateScaled: item.rate * 60000
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview - Price & Rate Trends</CardTitle>
        <p className="text-sm text-gray-600">
          Historical home prices and mortgage rates over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                yAxisId="price"
                orientation="left"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="rate"
                orientation="right"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Median Price"
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="rate"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Mortgage Rate"
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">
              Latest Price: {formatCurrency(data[data.length - 1]?.price || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">
              Latest Rate: {(data[data.length - 1]?.rate || 0).toFixed(2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}