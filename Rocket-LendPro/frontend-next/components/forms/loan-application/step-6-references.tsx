'use client';

import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ReferencesData } from '@/lib/schemas/loan-application.schema';
import { Users, Plus, Trash2, Briefcase, Heart, FileCheck } from 'lucide-react';

export function Step6References() {
  const {
    control,
    formState: { errors }
  } = useFormContext<{ references: ReferencesData; agreements: any }>();

  const { fields: personalFields, append: appendPersonal, remove: removePersonal } = useFieldArray({
    control,
    name: 'references.personal'
  });

  const { fields: professionalFields, append: appendProfessional, remove: removeProfessional } = useFieldArray({
    control,
    name: 'references.professional'
  });

  const addPersonalReference = () => {
    if (personalFields.length < 5) {
      appendPersonal({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        yearsKnown: 0
      });
    }
  };

  const addProfessionalReference = () => {
    if (professionalFields.length < 3) {
      appendProfessional({
        name: '',
        title: '',
        company: '',
        phone: '',
        email: '',
        relationship: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">References & Agreements</h2>
        <p className="text-gray-600">Provide references and review important agreements</p>
      </div>

      {/* Personal References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Personal References
              <span className="text-sm font-normal text-red-600">(At least 1 required)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPersonalReference}
              disabled={personalFields.length >= 5}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Reference
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalFields.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No personal references added yet</p>
              <Button
                type="button"
                variant="outline"
                onClick={addPersonalReference}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Reference
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {personalFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Personal Reference {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePersonal(index)}
                      disabled={personalFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name={`references.personal.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Full Name"
                          error={errors.references?.personal?.[index]?.name?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.personal.${index}.relationship`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Relationship"
                          placeholder="e.g., Friend, Family Member, Neighbor"
                          error={errors.references?.personal?.[index]?.relationship?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.personal.${index}.phone`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="tel"
                          label="Phone Number"
                          placeholder="(555) 123-4567"
                          error={errors.references?.personal?.[index]?.phone?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.personal.${index}.email`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          label="Email Address"
                          error={errors.references?.personal?.[index]?.email?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.personal.${index}.yearsKnown`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          label="Years Known"
                          error={errors.references?.personal?.[index]?.yearsKnown?.message}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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

      {/* Professional References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional References
              <span className="text-sm font-normal text-gray-600">(Optional)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProfessionalReference}
              disabled={professionalFields.length >= 3}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Reference
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {professionalFields.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No professional references added</p>
              <p className="text-sm text-gray-500 mb-4">
                Professional references can strengthen your application
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={addProfessionalReference}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Professional Reference
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {professionalFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Professional Reference {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProfessional(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name={`references.professional.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Full Name"
                          error={errors.references?.professional?.[index]?.name?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.professional.${index}.title`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Job Title"
                          error={errors.references?.professional?.[index]?.title?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.professional.${index}.company`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Company"
                          error={errors.references?.professional?.[index]?.company?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.professional.${index}.relationship`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Professional Relationship"
                          placeholder="e.g., Former Supervisor, Colleague, Client"
                          error={errors.references?.professional?.[index]?.relationship?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.professional.${index}.phone`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="tel"
                          label="Phone Number"
                          placeholder="(555) 123-4567"
                          error={errors.references?.professional?.[index]?.phone?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`references.professional.${index}.email`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          label="Email Address"
                          error={errors.references?.professional?.[index]?.email?.message}
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

      {/* Agreements & Disclosures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Required Agreements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="agreements.creditCheck"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Credit Check Authorization"
                description="I authorize LendPro to obtain my credit report and credit score for the purpose of this loan application."
                error={errors.agreements?.creditCheck?.message}
              />
            )}
          />

          <Controller
            name="agreements.termsAndConditions"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Terms and Conditions Agreement"
                description="I have read, understood, and agree to the Terms and Conditions of this loan application."
                error={errors.agreements?.termsAndConditions?.message}
              />
            )}
          />

          <Controller
            name="agreements.privacyPolicy"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Privacy Policy Acknowledgment"
                description="I acknowledge that I have read and understood the Privacy Policy regarding how my personal information will be used and protected."
                error={errors.agreements?.privacyPolicy?.message}
              />
            )}
          />

          <Controller
            name="agreements.electronicCommunication"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Electronic Communication Consent (Optional)"
                description="I consent to receive loan-related communications via email and electronic means."
                error={errors.agreements?.electronicCommunication?.message}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Reference Guidelines */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-yellow-900 mb-3">👥 Reference Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-yellow-800">
            <div>
              <h5 className="font-medium mb-2">Personal References Should:</h5>
              <ul className="space-y-1">
                <li>• Have known you for at least 2 years</li>
                <li>• Not be related to you</li>
                <li>• Be willing to be contacted by our team</li>
                <li>• Have current and valid contact information</li>
                <li>• Be able to vouch for your character and reliability</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Professional References Should:</h5>
              <ul className="space-y-1">
                <li>• Be current or former colleagues/supervisors</li>
                <li>• Have worked with you professionally</li>
                <li>• Be able to speak to your work ethic and reliability</li>
                <li>• Include their professional title and company</li>
                <li>• Be available during business hours for contact</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> References may be contacted during the loan review process. 
              Please ensure you have their permission before adding them to your application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}