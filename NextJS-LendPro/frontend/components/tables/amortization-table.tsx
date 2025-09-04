'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { AmortizationPayment } from '@/lib/api';
import { Download, Search } from 'lucide-react';

interface AmortizationTableProps {
  schedule: AmortizationPayment[];
  loanAmount: number;
}

export function AmortizationTable({ schedule, loanAmount }: AmortizationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');

  const filteredSchedule = useMemo(() => {
    if (!searchTerm) return schedule;
    
    return schedule.filter(payment => 
      payment.paymentNumber.toString().includes(searchTerm) ||
      payment.paymentDate.includes(searchTerm)
    );
  }, [schedule, searchTerm]);

  const yearlySchedule = useMemo(() => {
    const yearlyData: { [key: number]: AmortizationPayment } = {};
    
    schedule.forEach((payment) => {
      const year = Math.ceil(payment.paymentNumber / 12);
      if (!yearlyData[year]) {
        yearlyData[year] = {
          paymentNumber: year,
          paymentDate: `Year ${year}`,
          principal: 0,
          interest: 0,
          totalPayment: 0,
          remainingBalance: 0
        };
      }
      yearlyData[year].principal += payment.principal;
      yearlyData[year].interest += payment.interest;
      yearlyData[year].totalPayment += payment.totalPayment;
      yearlyData[year].remainingBalance = payment.remainingBalance;
    });

    return Object.values(yearlyData);
  }, [schedule]);

  const displaySchedule = viewType === 'yearly' ? yearlySchedule : filteredSchedule;
  
  const paginatedSchedule = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return displaySchedule.slice(startIndex, endIndex);
  }, [displaySchedule, currentPage, pageSize]);

  const totalPages = Math.ceil(displaySchedule.length / pageSize);

  const exportToCSV = () => {
    const headers = ['Payment #', 'Date', 'Principal', 'Interest', 'Total Payment', 'Remaining Balance'];
    const csvData = [
      headers.join(','),
      ...schedule.map(payment => [
        payment.paymentNumber,
        payment.paymentDate,
        payment.principal,
        payment.interest,
        payment.totalPayment,
        payment.remainingBalance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `amortization-schedule-${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Amortization Schedule</CardTitle>
            <p className="text-sm text-gray-600">
              Loan Amount: {formatCurrency(loanAmount)} | {schedule.length} payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewType(viewType === 'monthly' ? 'yearly' : 'monthly')}
            >
              {viewType === 'monthly' ? 'Yearly View' : 'Monthly View'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder={`Search ${viewType === 'monthly' ? 'payment number or date' : 'year'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={60}>60 per page</option>
            <option value={120}>120 per page</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {viewType === 'monthly' ? 'Payment #' : 'Year'}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Principal</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Interest</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Total Payment
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Remaining Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSchedule.map((payment, index) => (
                <tr 
                  key={`${payment.paymentNumber}-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    payment.remainingBalance === 0 ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-gray-900">{payment.paymentNumber}</td>
                  <td className="py-3 px-4 text-gray-600">{payment.paymentDate}</td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {formatCurrency(payment.principal)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {formatCurrency(payment.interest)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(payment.totalPayment)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {formatCurrency(payment.remainingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, displaySchedule.length)} to{' '}
              {Math.min(currentPage * pageSize, displaySchedule.length)} of {displaySchedule.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Loan Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-600">Total Payments</p>
              <p className="font-semibold">{schedule.length}</p>
            </div>
            <div>
              <p className="text-blue-600">Total Interest</p>
              <p className="font-semibold">
                {formatCurrency(
                  schedule.reduce((sum, payment) => sum + payment.interest, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-blue-600">Total Paid</p>
              <p className="font-semibold">
                {formatCurrency(
                  schedule.reduce((sum, payment) => sum + payment.totalPayment, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-blue-600">Interest %</p>
              <p className="font-semibold">
                {(
                  (schedule.reduce((sum, payment) => sum + payment.interest, 0) / loanAmount) * 100
                ).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}