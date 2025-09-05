'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PersonalInfoData } from '@/lib/schemas/loan-application.schema';
import { User, MapPin, Phone, Mail } from 'lucide-react';

const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
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

export function Step1PersonalInfo() {
  const {
    control,
    formState: { errors },
    watch
  } = useFormContext<{ personalInfo: PersonalInfoData }>();

  const watchYearsAtAddress = watch('personalInfo.currentAddress.yearsAtAddress');
  const showPreviousAddress = watchYearsAtAddress !== undefined && watchYearsAtAddress < 2;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Tell us about yourself and your current situation</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="personalInfo.firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="First Name"
                  error={errors.personalInfo?.firstName?.message}
                  autoComplete="given-name"
                />
              )}
            />

            <Controller
              name="personalInfo.lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Last Name"
                  error={errors.personalInfo?.lastName?.message}
                  autoComplete="family-name"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="personalInfo.dateOfBirth"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Date of Birth"
                  error={errors.personalInfo?.dateOfBirth?.message}
                  autoComplete="bday"
                />
              )}
            />

            <Controller
              name="personalInfo.ssn"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Social Security Number"
                  placeholder="XXX-XX-XXXX"
                  error={errors.personalInfo?.ssn?.message}
                  maxLength={11}
                  onChange={(e) => {
                    // Auto-format SSN with dashes
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 4) value = value.slice(0, 3) + '-' + value.slice(3);
                    if (value.length >= 7) value = value.slice(0, 6) + '-' + value.slice(6, 10);
                    field.onChange(value);
                  }}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="personalInfo.maritalStatus"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Marital Status"
                  options={maritalStatusOptions}
                  placeholder="Select marital status"
                  error={errors.personalInfo?.maritalStatus?.message}
                />
              )}
            />

            <Controller
              name="personalInfo.dependents"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Number of Dependents"
                  error={errors.personalInfo?.dependents?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="personalInfo.phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="tel"
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  error={errors.personalInfo?.phone?.message}
                  autoComplete="tel"
                />
              )}
            />

            <Controller
              name="personalInfo.email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  label="Email Address"
                  error={errors.personalInfo?.email?.message}
                  autoComplete="email"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="personalInfo.currentAddress.street"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Street Address"
                error={errors.personalInfo?.currentAddress?.street?.message}
                autoComplete="street-address"
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="personalInfo.currentAddress.city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="City"
                  error={errors.personalInfo?.currentAddress?.city?.message}
                  autoComplete="address-level2"
                />
              )}
            />

            <Controller
              name="personalInfo.currentAddress.state"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="State"
                  options={stateOptions}
                  placeholder="Select state"
                  error={errors.personalInfo?.currentAddress?.state?.message}
                />
              )}
            />

            <Controller
              name="personalInfo.currentAddress.zipCode"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="ZIP Code"
                  placeholder="12345"
                  error={errors.personalInfo?.currentAddress?.zipCode?.message}
                  autoComplete="postal-code"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="personalInfo.currentAddress.yearsAtAddress"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  label="Years at Current Address"
                  error={errors.personalInfo?.currentAddress?.yearsAtAddress?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="personalInfo.currentAddress.monthsAtAddress"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="11"
                  label="Additional Months"
                  error={errors.personalInfo?.currentAddress?.monthsAtAddress?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Previous Address (conditional) */}
      {showPreviousAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Previous Address
              <span className="text-sm font-normal text-gray-600">
                (Required for applicants with less than 2 years at current address)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="personalInfo.previousAddress.street"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Street Address"
                  error={errors.personalInfo?.previousAddress?.street?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="personalInfo.previousAddress.city"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="City"
                    error={errors.personalInfo?.previousAddress?.city?.message}
                  />
                )}
              />

              <Controller
                name="personalInfo.previousAddress.state"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="State"
                    options={stateOptions}
                    placeholder="Select state"
                    error={errors.personalInfo?.previousAddress?.state?.message}
                  />
                )}
              />

              <Controller
                name="personalInfo.previousAddress.zipCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="ZIP Code"
                    placeholder="12345"
                    error={errors.personalInfo?.previousAddress?.zipCode?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="personalInfo.previousAddress.yearsAtAddress"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    label="Years at Previous Address"
                    error={errors.personalInfo?.previousAddress?.yearsAtAddress?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="personalInfo.previousAddress.monthsAtAddress"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    max="11"
                    label="Additional Months"
                    error={errors.personalInfo?.previousAddress?.monthsAtAddress?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}