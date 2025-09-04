'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/mortgage-utils';

interface PaymentBreakdownChartProps {
  principal: number;
  interest: number;
  taxes?: number;
  insurance?: number;
  pmi?: number;
  hoa?: number;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

export function PaymentBreakdownChart({
  principal,
  interest,
  taxes = 0,
  insurance = 0,
  pmi = 0,
  hoa = 0
}: PaymentBreakdownChartProps) {
  const data = [
    { name: 'Principal & Interest', value: principal, color: COLORS[0] },
    { name: 'Property Tax', value: taxes, color: COLORS[2] },
    { name: 'Insurance', value: insurance, color: COLORS[3] },
    { name: 'PMI', value: pmi, color: COLORS[4] },
    { name: 'HOA', value: hoa, color: COLORS[5] }
  ].filter(item => item.value > 0);

  const totalPayment = principal + taxes + insurance + pmi + hoa;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-blue-600">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            {((data.value / totalPayment) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Payment Breakdown</CardTitle>
        <p className="text-sm text-gray-600">
          Total: {formatCurrency(totalPayment)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {value}: {formatCurrency(entry.payload.value)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}