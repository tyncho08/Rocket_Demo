'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/utils/mortgage-utils';
import { X, Clock, Trash2, Download } from 'lucide-react';

interface CalculationHistoryProps {
  history: Array<{
    id: string;
    date: string;
    name?: string;
    params: any;
    result: any;
  }>;
  onLoad: (item: any) => void;
  onClose: () => void;
}

export function CalculationHistory({ history, onLoad, onClose }: CalculationHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteItem = (id: string) => {
    // This would be handled by the store
    // For now, we'll just show the UI
  };

  const exportHistory = () => {
    const csvData = history.map(item => ({
      Date: formatDate(item.date),
      Name: item.name || 'Unnamed',
      LoanAmount: item.params.loanAmount,
      InterestRate: item.params.interestRate,
      LoanTerm: item.params.loanTermYears,
      MonthlyPayment: item.result.monthlyPayment,
      TotalInterest: item.result.totalInterest
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-calculations-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Calculation History
          </CardTitle>
          <div className="flex gap-2">
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportHistory}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No saved calculations yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Save your calculations to access them later
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {item.name || `${formatCurrency(item.params.loanAmount)} Loan`}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex gap-4">
                      <span>
                        <strong>Amount:</strong> {formatCurrency(item.params.loanAmount)}
                      </span>
                      <span>
                        <strong>Rate:</strong> {formatPercent(item.params.interestRate)}
                      </span>
                      <span>
                        <strong>Term:</strong> {item.params.loanTermYears} years
                      </span>
                    </div>
                    <div>
                      <strong>Monthly Payment:</strong> {formatCurrency(item.result.monthlyPayment)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoad(item)}
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Calculations are automatically saved for 30 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}