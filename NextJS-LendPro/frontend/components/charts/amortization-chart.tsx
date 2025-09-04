'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { AmortizationPayment } from '@/lib/api';

interface AmortizationChartProps {
  schedule: AmortizationPayment[];
  showYears?: boolean;
}

export function AmortizationChart({ schedule, showYears = false }: AmortizationChartProps) {
  // Group by year if showing years, otherwise show monthly
  const chartData = showYears 
    ? groupByYear(schedule)
    : schedule.map(payment => ({
        period: `Month ${payment.paymentNumber}`,
        principal: payment.principal,
        interest: payment.interest,
        balance: payment.remainingBalance
      }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showYears ? 'Annual' : 'Monthly'} Principal vs Interest
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="principal" 
                fill="#3B82F6" 
                name="Principal"
                radius={[0, 0, 4, 4]}
              />
              <Bar 
                dataKey="interest" 
                fill="#EF4444" 
                name="Interest"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function groupByYear(schedule: AmortizationPayment[]) {
  const yearlyData: { [key: number]: { principal: number; interest: number; balance: number } } = {};
  
  schedule.forEach((payment) => {
    const year = Math.ceil(payment.paymentNumber / 12);
    if (!yearlyData[year]) {
      yearlyData[year] = { principal: 0, interest: 0, balance: 0 };
    }
    yearlyData[year].principal += payment.principal;
    yearlyData[year].interest += payment.interest;
    yearlyData[year].balance = payment.remainingBalance; // Take the last balance of the year
  });

  return Object.keys(yearlyData).map(year => ({
    period: `Year ${year}`,
    principal: Math.round(yearlyData[Number(year)].principal),
    interest: Math.round(yearlyData[Number(year)].interest),
    balance: Math.round(yearlyData[Number(year)].balance)
  }));
}