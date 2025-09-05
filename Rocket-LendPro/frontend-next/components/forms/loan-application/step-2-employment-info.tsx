'use client';

import { useState } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EmploymentInfoData } from '@/lib/schemas/loan-application.schema';
import { Briefcase, Building, Plus, Trash2, DollarSign } from 'lucide-react';

const employmentStatusOptions = [
  { value: 'employed', label: 'Employed (W-2)' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' }
];

const incomeFrequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

export function Step2EmploymentInfo() {
  const [showPreviousEmployment, setShowPreviousEmployment] = useState(false);
  
  const {
    control,
    formState: { errors },
    watch
  } = useFormContext<{ employmentInfo: EmploymentInfoData }>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'employmentInfo.additionalIncome'
  });

  const employmentStatus = watch('employmentInfo.employmentStatus');
  const isEmployed = employmentStatus === 'employed' || employmentStatus === 'self-employed';
  const yearsEmployed = watch('employmentInfo.currentEmployment.yearsEmployed');
  const showPreviousRequired = yearsEmployed !== undefined && yearsEmployed < 2;

  const addAdditionalIncome = () => {
    append({ source: '', amount: 0, frequency: 'monthly' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Employment Information</h2>
        <p className="text-gray-600">Tell us about your employment and income sources</p>
      </div>

      {/* Employment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="employmentInfo.employmentStatus"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Current Employment Status"
                options={employmentStatusOptions}
                placeholder="Select employment status"
                error={errors.employmentInfo?.employmentStatus?.message}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Current Employment (if employed) */}
      {isEmployed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Current Employment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="employmentInfo.currentEmployment.employer"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Employer Name"
                    error={errors.employmentInfo?.currentEmployment?.employer?.message}
                  />
                )}
              />

              <Controller
                name="employmentInfo.currentEmployment.jobTitle"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Job Title"
                    error={errors.employmentInfo?.currentEmployment?.jobTitle?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="employmentInfo.currentEmployment.yearsEmployed"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    label="Years Employed"
                    error={errors.employmentInfo?.currentEmployment?.yearsEmployed?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="employmentInfo.currentEmployment.monthsEmployed"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    max="11"
                    label="Additional Months"
                    error={errors.employmentInfo?.currentEmployment?.monthsEmployed?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="employmentInfo.currentEmployment.monthlyIncome"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    label="Monthly Income"
                    prefix="$"
                    error={errors.employmentInfo?.currentEmployment?.monthlyIncome?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>

            <Controller
              name="employmentInfo.currentEmployment.employerPhone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="tel"
                  label="Employer Phone Number"
                  placeholder="(555) 123-4567"
                  error={errors.employmentInfo?.currentEmployment?.employerPhone?.message}
                />
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Employer Address</h4>
              
              <Controller
                name="employmentInfo.currentEmployment.employerAddress.street"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Street Address"
                    error={errors.employmentInfo?.currentEmployment?.employerAddress?.street?.message}
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="employmentInfo.currentEmployment.employerAddress.city"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="City"
                      error={errors.employmentInfo?.currentEmployment?.employerAddress?.city?.message}
                    />
                  )}
                />

                <Controller
                  name="employmentInfo.currentEmployment.employerAddress.state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="State"
                      options={stateOptions}
                      placeholder="Select state"
                      error={errors.employmentInfo?.currentEmployment?.employerAddress?.state?.message}
                    />
                  )}
                />

                <Controller
                  name="employmentInfo.currentEmployment.employerAddress.zipCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="ZIP Code"
                      placeholder="12345"
                      error={errors.employmentInfo?.currentEmployment?.employerAddress?.zipCode?.message}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Employment (if required or requested) */}
      {isEmployed && (showPreviousRequired || showPreviousEmployment) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Previous Employment
                {showPreviousRequired && (
                  <span className="text-sm font-normal text-red-600">
                    (Required - less than 2 years at current job)
                  </span>
                )}
              </div>
              {!showPreviousRequired && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviousEmployment(false)}
                >
                  Remove
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="employmentInfo.previousEmployment.employer"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Previous Employer"
                    error={errors.employmentInfo?.previousEmployment?.employer?.message}
                  />
                )}
              />

              <Controller
                name="employmentInfo.previousEmployment.jobTitle"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Job Title"
                    error={errors.employmentInfo?.previousEmployment?.jobTitle?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Controller
                name="employmentInfo.previousEmployment.yearsEmployed"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    label="Years Employed"
                    error={errors.employmentInfo?.previousEmployment?.yearsEmployed?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="employmentInfo.previousEmployment.monthsEmployed"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    max="11"
                    label="Additional Months"
                    error={errors.employmentInfo?.previousEmployment?.monthsEmployed?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="employmentInfo.previousEmployment.monthlyIncome"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    label="Monthly Income"
                    prefix="$"
                    error={errors.employmentInfo?.previousEmployment?.monthlyIncome?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="employmentInfo.previousEmployment.reasonForLeaving"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Reason for Leaving"
                    error={errors.employmentInfo?.previousEmployment?.reasonForLeaving?.message}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Previous Employment Button */}
      {isEmployed && !showPreviousRequired && !showPreviousEmployment && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviousEmployment(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Previous Employment
          </Button>
        </div>
      )}

      {/* Additional Income */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Additional Income
              <span className="text-sm font-normal text-gray-600">(Optional)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAdditionalIncome}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Income Source
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No additional income sources added. This includes rental income, investments, alimony, etc.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Income Source {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Controller
                      name={`employmentInfo.additionalIncome.${index}.source`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Income Source"
                          placeholder="e.g., Rental Income, Investments"
                          error={errors.employmentInfo?.additionalIncome?.[index]?.source?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`employmentInfo.additionalIncome.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          label="Amount"
                          prefix="$"
                          error={errors.employmentInfo?.additionalIncome?.[index]?.amount?.message}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />

                    <Controller
                      name={`employmentInfo.additionalIncome.${index}.frequency`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Frequency"
                          options={incomeFrequencyOptions}
                          error={errors.employmentInfo?.additionalIncome?.[index]?.frequency?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}