'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyInfoData } from '@/lib/schemas/loan-application.schema';
import { formatCurrency } from '@/lib/utils/mortgage-utils';
import { MapPin, Home, Shield, Wrench } from 'lucide-react';

const propertyTypeOptions = [
  { value: 'single-family', label: 'Single Family Home' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi-family', label: 'Multi-Family (2-4 units)' },
  { value: 'manufactured', label: 'Manufactured/Mobile Home' }
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

export function Step5PropertyInfo() {
  const {
    control,
    formState: { errors },
    watch
  } = useFormContext<{ propertyInfo: PropertyInfoData }>();

  const watchedValues = watch('propertyInfo');
  const hasHOA = watchedValues?.hasHOA;

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Information</h2>
        <p className="text-gray-600">Provide details about the property you're financing</p>
      </div>

      {/* Property Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="propertyInfo.address.street"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Street Address"
                error={errors.propertyInfo?.address?.street?.message}
                autoComplete="street-address"
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="propertyInfo.address.city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="City"
                  error={errors.propertyInfo?.address?.city?.message}
                  autoComplete="address-level2"
                />
              )}
            />

            <Controller
              name="propertyInfo.address.state"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="State"
                  options={stateOptions}
                  placeholder="Select state"
                  error={errors.propertyInfo?.address?.state?.message}
                />
              )}
            />

            <Controller
              name="propertyInfo.address.zipCode"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="ZIP Code"
                  placeholder="12345"
                  error={errors.propertyInfo?.address?.zipCode?.message}
                  autoComplete="postal-code"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="propertyInfo.propertyType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Property Type"
                  options={propertyTypeOptions}
                  placeholder="Select property type"
                  error={errors.propertyInfo?.propertyType?.message}
                />
              )}
            />

            <Controller
              name="propertyInfo.yearBuilt"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="1800"
                  max={currentYear + 2}
                  label="Year Built"
                  error={errors.propertyInfo?.yearBuilt?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="propertyInfo.squareFeet"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="100"
                  label="Square Feet"
                  suffix="sq ft"
                  error={errors.propertyInfo?.squareFeet?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="propertyInfo.bedrooms"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="20"
                  label="Bedrooms"
                  error={errors.propertyInfo?.bedrooms?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="propertyInfo.bathrooms"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  label="Bathrooms"
                  error={errors.propertyInfo?.bathrooms?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          <Controller
            name="propertyInfo.lotSize"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                min="0"
                label="Lot Size (Optional)"
                suffix="sq ft"
                error={errors.propertyInfo?.lotSize?.message}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Property Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Property Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="propertyInfo.garage"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Garage or Covered Parking"
                  error={errors.propertyInfo?.garage?.message}
                />
              )}
            />

            <Controller
              name="propertyInfo.pool"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Swimming Pool"
                  error={errors.propertyInfo?.pool?.message}
                />
              )}
            />

            <Controller
              name="propertyInfo.hasHOA"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Homeowners Association (HOA)"
                  error={errors.propertyInfo?.hasHOA?.message}
                />
              )}
            />

            {hasHOA && (
              <Controller
                name="propertyInfo.hoaFees"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    label="Monthly HOA Fees"
                    prefix="$"
                    error={errors.propertyInfo?.hoaFees?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Taxes & Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Property Taxes & Insurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="propertyInfo.propertyTaxes"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Annual Property Taxes"
                  prefix="$"
                  error={errors.propertyInfo?.propertyTaxes?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="propertyInfo.homeInsurance"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Annual Home Insurance"
                  prefix="$"
                  error={errors.propertyInfo?.homeInsurance?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          {/* Monthly costs display */}
          {(watchedValues?.propertyTaxes || watchedValues?.homeInsurance || watchedValues?.hoaFees) && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">Monthly Housing Costs</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {watchedValues.propertyTaxes && (
                  <div>
                    <p className="text-green-600 font-medium">Property Taxes</p>
                    <p className="font-semibold">{formatCurrency((watchedValues.propertyTaxes || 0) / 12)}</p>
                  </div>
                )}
                {watchedValues.homeInsurance && (
                  <div>
                    <p className="text-green-600 font-medium">Home Insurance</p>
                    <p className="font-semibold">{formatCurrency((watchedValues.homeInsurance || 0) / 12)}</p>
                  </div>
                )}
                {watchedValues.hoaFees && (
                  <div>
                    <p className="text-green-600 font-medium">HOA Fees</p>
                    <p className="font-semibold">{formatCurrency(watchedValues.hoaFees || 0)}</p>
                  </div>
                )}
                <div>
                  <p className="text-green-600 font-medium">Total Monthly</p>
                  <p className="font-semibold text-green-700">
                    {formatCurrency(
                      ((watchedValues.propertyTaxes || 0) / 12) + 
                      ((watchedValues.homeInsurance || 0) / 12) + 
                      (watchedValues.hoaFees || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Information Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-3">🏠 Property Information Tips</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Property tax amounts can often be found on your property tax bill or county assessor website</li>
            <li>• Home insurance quotes should be obtained from multiple providers for best rates</li>
            <li>• HOA fees typically include common area maintenance, amenities, and sometimes utilities</li>
            <li>• Older homes may require additional inspections or higher insurance premiums</li>
            <li>• Investment properties and condos may have different insurance requirements</li>
            <li>• We may require a professional appraisal to verify property value and condition</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}