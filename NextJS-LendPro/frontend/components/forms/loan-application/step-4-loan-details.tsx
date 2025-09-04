'use client';

import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoanDetailsData } from '@/lib/schemas/loan-application.schema';
import { formatCurrency, formatPercent } from '@/lib/utils/mortgage-utils';
import { mortgageService } from '@/lib/api';
import { Calculator, Home, DollarSign } from 'lucide-react';

const loanPurposeOptions = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'refinance', label: 'Refinance' },
  { value: 'cashout-refinance', label: 'Cash-Out Refinance' },
  { value: 'home-equity', label: 'Home Equity Loan' }
];

const occupancyTypeOptions = [
  { value: 'primary', label: 'Primary Residence' },
  { value: 'secondary', label: 'Second Home' },
  { value: 'investment', label: 'Investment Property' }
];

const loanTermOptions = [
  { value: 15, label: '15 Years' },
  { value: 20, label: '20 Years' },
  { value: 25, label: '25 Years' },
  { value: 30, label: '30 Years' }
];

export function Step4LoanDetails() {
  const {
    control,
    formState: { errors },
    watch
  } = useFormContext<{ loanDetails: LoanDetailsData }>();

  const watchedValues = watch('loanDetails');

  // Calculate loan-to-value ratio
  const ltvRatio = useMemo(() => {
    if (!watchedValues?.loanAmount || !watchedValues?.propertyValue) return 0;
    return (watchedValues.loanAmount / watchedValues.propertyValue) * 100;
  }, [watchedValues?.loanAmount, watchedValues?.propertyValue]);

  // Calculate down payment percentage
  const downPaymentPercent = useMemo(() => {
    if (!watchedValues?.downPayment || !watchedValues?.propertyValue) return 0;
    return (watchedValues.downPayment / watchedValues.propertyValue) * 100;
  }, [watchedValues?.downPayment, watchedValues?.propertyValue]);

  // Calculate estimated monthly payment
  const monthlyPayment = useMemo(() => {
    if (!watchedValues?.loanAmount || !watchedValues?.interestRate || !watchedValues?.loanTermYears) {
      return 0;
    }
    try {
      return mortgageService.calculateMonthlyPayment(
        watchedValues.loanAmount,
        watchedValues.interestRate,
        watchedValues.loanTermYears
      );
    } catch {
      return 0;
    }
  }, [watchedValues?.loanAmount, watchedValues?.interestRate, watchedValues?.loanTermYears]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Details</h2>
        <p className="text-gray-600">Specify the loan amount, terms, and property information</p>
      </div>

      {/* Loan Purpose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Loan Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="loanDetails.loanPurpose"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Loan Purpose"
                  options={loanPurposeOptions}
                  placeholder="Select loan purpose"
                  error={errors.loanDetails?.loanPurpose?.message}
                />
              )}
            />

            <Controller
              name="loanDetails.occupancyType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Occupancy Type"
                  options={occupancyTypeOptions}
                  placeholder="Select occupancy type"
                  error={errors.loanDetails?.occupancyType?.message}
                />
              )}
            />
          </div>

          {watchedValues?.loanPurpose === 'cashout-refinance' && (
            <Controller
              name="loanDetails.cashOutAmount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Cash Out Amount"
                  prefix="$"
                  error={errors.loanDetails?.cashOutAmount?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Property & Loan Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Property & Loan Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="loanDetails.propertyValue"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Property Value"
                  prefix="$"
                  error={errors.loanDetails?.propertyValue?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="loanDetails.downPayment"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Down Payment"
                  prefix="$"
                  error={errors.loanDetails?.downPayment?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          <Controller
            name="loanDetails.loanAmount"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                min="0"
                label="Requested Loan Amount"
                prefix="$"
                error={errors.loanDetails?.loanAmount?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          {/* Loan ratios display */}
          {watchedValues?.propertyValue && watchedValues?.loanAmount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Loan Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">Loan-to-Value</p>
                  <p className={`font-semibold ${ltvRatio > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {formatPercent(ltvRatio)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Down Payment</p>
                  <p className="font-semibold text-green-600">
                    {formatPercent(downPaymentPercent)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Down Payment $</p>
                  <p className="font-semibold">{formatCurrency(watchedValues.downPayment || 0)}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Loan Amount</p>
                  <p className="font-semibold">{formatCurrency(watchedValues.loanAmount || 0)}</p>
                </div>
              </div>
              
              {ltvRatio > 80 && (
                <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>PMI Required:</strong> Loans with LTV above 80% typically require Private Mortgage Insurance.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="loanDetails.interestRate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.001"
                  min="0.1"
                  max="30"
                  label="Interest Rate (Annual %)"
                  suffix="%"
                  error={errors.loanDetails?.interestRate?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="loanDetails.loanTermYears"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Loan Term"
                  options={loanTermOptions.map(option => ({
                    value: option.value.toString(),
                    label: option.label
                  }))}
                  placeholder="Select loan term"
                  error={errors.loanDetails?.loanTermYears?.message}
                  onChange={(value) => field.onChange(Number(value))}
                />
              )}
            />
          </div>

          {/* Payment calculation display */}
          {monthlyPayment > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">Estimated Monthly Payment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600 font-medium">Principal & Interest</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(monthlyPayment)}</p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Total Interest</p>
                  <p className="font-semibold text-green-700">
                    {formatCurrency((monthlyPayment * (watchedValues?.loanTermYears || 30) * 12) - (watchedValues?.loanAmount || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Total Payments</p>
                  <p className="font-semibold text-green-700">
                    {formatCurrency(monthlyPayment * (watchedValues?.loanTermYears || 30) * 12)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">
                * This is an estimate. Your actual payment may include property taxes, insurance, PMI, and HOA fees.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-gray-900 mb-3">📋 Important Notes</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Property values should reflect current market value or purchase price</li>
            <li>• Interest rates are subject to change and depend on your credit profile</li>
            <li>• Loan amounts above $766,550 are considered jumbo loans with different terms</li>
            <li>• Investment properties typically require larger down payments (20-25%)</li>
            <li>• We'll provide official loan estimates after reviewing your complete application</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}