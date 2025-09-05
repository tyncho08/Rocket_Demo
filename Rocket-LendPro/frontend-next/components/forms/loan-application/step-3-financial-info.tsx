'use client';

import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FinancialInfoData } from '@/lib/schemas/loan-application.schema';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';

export function Step3FinancialInfo() {
  const {
    control,
    formState: { errors },
    watch
  } = useFormContext<{ financialInfo: FinancialInfoData }>();

  const watchedValues = watch('financialInfo');

  // Calculate totals
  const totalAssets = useMemo(() => {
    if (!watchedValues?.assets) return 0;
    const { checking = 0, savings = 0, investments = 0, retirement = 0, otherAssets = 0 } = watchedValues.assets;
    return checking + savings + investments + retirement + otherAssets;
  }, [watchedValues?.assets]);

  const totalLiabilities = useMemo(() => {
    if (!watchedValues?.liabilities) return 0;
    const { creditCards = 0, autoLoans = 0, studentLoans = 0, otherDebts = 0 } = watchedValues.liabilities;
    return creditCards + autoLoans + studentLoans + otherDebts;
  }, [watchedValues?.liabilities]);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Information</h2>
        <p className="text-gray-600">Provide details about your income, assets, and liabilities</p>
      </div>

      {/* Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="financialInfo.annualIncome"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Total Annual Income"
                  prefix="$"
                  error={errors.financialInfo?.annualIncome?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.monthlyDebts"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Total Monthly Debt Payments"
                  prefix="$"
                  error={errors.financialInfo?.monthlyDebts?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          {/* Quick calculation display */}
          {watchedValues?.annualIncome && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">Monthly Income</p>
                  <p className="font-semibold">{formatCurrency(watchedValues.annualIncome / 12)}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Monthly Debts</p>
                  <p className="font-semibold">{formatCurrency(watchedValues.monthlyDebts || 0)}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Available Income</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency((watchedValues.annualIncome / 12) - (watchedValues.monthlyDebts || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">DTI Ratio</p>
                  <p className="font-semibold">
                    {((watchedValues.monthlyDebts || 0) / (watchedValues.annualIncome / 12) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="financialInfo.assets.checking"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Checking Account Balance"
                  prefix="$"
                  error={errors.financialInfo?.assets?.checking?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.assets.savings"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Savings Account Balance"
                  prefix="$"
                  error={errors.financialInfo?.assets?.savings?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.assets.investments"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Investment Accounts"
                  prefix="$"
                  error={errors.financialInfo?.assets?.investments?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.assets.retirement"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Retirement Accounts (401k, IRA)"
                  prefix="$"
                  error={errors.financialInfo?.assets?.retirement?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.assets.otherAssets"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Other Assets"
                  prefix="$"
                  error={errors.financialInfo?.assets?.otherAssets?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-700">Total Assets:</span>
              <span className="text-xl font-bold text-green-700">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Liabilities & Debts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="financialInfo.liabilities.creditCards"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Credit Card Balances"
                  prefix="$"
                  error={errors.financialInfo?.liabilities?.creditCards?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.liabilities.autoLoans"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Auto Loan Balances"
                  prefix="$"
                  error={errors.financialInfo?.liabilities?.autoLoans?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.liabilities.studentLoans"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Student Loan Balances"
                  prefix="$"
                  error={errors.financialInfo?.liabilities?.studentLoans?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="financialInfo.liabilities.otherDebts"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Other Debts"
                  prefix="$"
                  error={errors.financialInfo?.liabilities?.otherDebts?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-red-700">Total Liabilities:</span>
              <span className="text-xl font-bold text-red-700">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Worth Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Assets</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalAssets)}</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalLiabilities)}</p>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${netWorth >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
              <p className={`text-sm font-medium ${netWorth >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                Net Worth
              </p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="financialInfo.creditScore"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                min="300"
                max="850"
                label="Credit Score (Optional)"
                placeholder="e.g., 750"
                error={errors.financialInfo?.creditScore?.message}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />

          <div className="space-y-3">
            <Controller
              name="financialInfo.bankruptcyHistory"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="I have filed for bankruptcy in the past 7 years"
                  error={errors.financialInfo?.bankruptcyHistory?.message}
                />
              )}
            />

            <Controller
              name="financialInfo.foreclosureHistory"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="I have had a foreclosure in the past 7 years"
                  error={errors.financialInfo?.foreclosureHistory?.message}
                />
              )}
            />
          </div>

          {(watchedValues?.bankruptcyHistory || watchedValues?.foreclosureHistory) && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Additional Documentation May Be Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your bankruptcy or foreclosure history may require additional documentation during the review process. 
                    Our team will contact you with specific requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helpful Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-3">💡 Financial Tips</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• A debt-to-income ratio below 36% is generally preferred by lenders</li>
            <li>• Having 3-6 months of expenses in liquid assets shows financial stability</li>
            <li>• Your net worth helps determine your overall financial strength</li>
            <li>• Credit scores above 740 typically qualify for the best mortgage rates</li>
            <li>• Be prepared to provide bank statements and tax returns to verify this information</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}