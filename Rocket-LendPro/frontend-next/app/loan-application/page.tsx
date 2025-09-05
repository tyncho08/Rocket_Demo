'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layouts/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StepIndicator } from '@/components/forms/step-indicator';

// Step Components
import { Step1PersonalInfo } from '@/components/forms/loan-application/step-1-personal-info';
import { Step2EmploymentInfo } from '@/components/forms/loan-application/step-2-employment-info';
import { Step3FinancialInfo } from '@/components/forms/loan-application/step-3-financial-info';
import { Step4LoanDetails } from '@/components/forms/loan-application/step-4-loan-details';
import { Step5PropertyInfo } from '@/components/forms/loan-application/step-5-property-info';
import { Step6References } from '@/components/forms/loan-application/step-6-references';

// Schema and Types
import { 
  loanApplicationSchema, 
  personalInfoSchema,
  employmentInfoSchema,
  financialInfoSchema,
  loanDetailsSchema,
  propertyInfoSchema,
  referencesSchema,
  LoanApplicationFormData 
} from '@/lib/schemas/loan-application.schema';

import { useLoanStore } from '@/lib/store/use-loan-store';
import { loanService } from '@/lib/api';
import { ChevronLeft, ChevronRight, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', description: 'Basic information and address' },
  { id: 2, title: 'Employment', description: 'Work history and income' },
  { id: 3, title: 'Financial', description: 'Assets and liabilities' },
  { id: 4, title: 'Loan Details', description: 'Loan amount and terms' },
  { id: 5, title: 'Property', description: 'Property information' },
  { id: 6, title: 'References', description: 'References and agreements' }
];

const stepSchemas = [
  null, // Index 0 - not used
  personalInfoSchema,
  employmentInfoSchema,
  financialInfoSchema,
  loanDetailsSchema,
  propertyInfoSchema,
  referencesSchema
];

export default function LoanApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    applicationProgress,
    setCurrentStep,
    setStepCompleted,
    updateFormData,
    resetApplication,
    getProgressPercentage,
    isStepValid
  } = useLoanStore();

  const { currentStep, completedSteps, formData } = applicationProgress;

  const methods = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',
        maritalStatus: 'single',
        dependents: 0,
        phone: '',
        email: '',
        currentAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          yearsAtAddress: 0,
          monthsAtAddress: 0
        },
        ...formData.personalInfo
      },
      employmentInfo: {
        employmentStatus: 'employed',
        ...formData.employmentInfo
      },
      financialInfo: {
        annualIncome: 0,
        monthlyDebts: 0,
        assets: {
          checking: 0,
          savings: 0,
          investments: 0,
          retirement: 0,
          otherAssets: 0
        },
        liabilities: {
          creditCards: 0,
          autoLoans: 0,
          studentLoans: 0,
          otherDebts: 0
        },
        bankruptcyHistory: false,
        foreclosureHistory: false,
        ...formData.financialInfo
      },
      loanDetails: {
        loanAmount: 0,
        propertyValue: 0,
        downPayment: 0,
        interestRate: 6.5,
        loanTermYears: 30,
        loanPurpose: 'purchase',
        occupancyType: 'primary',
        ...formData.loanDetails
      },
      propertyInfo: {
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        propertyType: 'single-family',
        yearBuilt: 2000,
        squareFeet: 0,
        bedrooms: 0,
        bathrooms: 0,
        garage: false,
        pool: false,
        hasHOA: false,
        propertyTaxes: 0,
        homeInsurance: 0,
        ...formData.propertyInfo
      },
      references: {
        personal: formData.references?.personal || [],
        professional: formData.references?.professional || []
      },
      agreements: {
        creditCheck: false,
        termsAndConditions: false,
        privacyPolicy: false,
        electronicCommunication: false,
        ...formData.agreements
      }
    },
    mode: 'onChange'
  });

  const { watch, trigger, getValues } = methods;
  const watchedData = watch();

  // Auto-save form data
  useEffect(() => {
    const subscription = watch((value) => {
      Object.keys(value).forEach((key) => {
        if (value[key] !== undefined) {
          updateFormData(key as keyof LoanApplicationFormData, value[key]);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      return await trigger('personalInfo');
    } else if (currentStep === 2) {
      return await trigger('employmentInfo');
    } else if (currentStep === 3) {
      return await trigger('financialInfo');
    } else if (currentStep === 4) {
      return await trigger('loanDetails');
    } else if (currentStep === 5) {
      return await trigger('propertyInfo');
    } else if (currentStep === 6) {
      return await trigger(['references', 'agreements']);
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setStepCompleted(currentStep);
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (completedSteps.has(stepNumber) || stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSave = () => {
    // Data is already auto-saved through the watch effect
    // Just show a confirmation
    alert('Application saved successfully!');
  };

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      setSubmitError('Please fix the errors in the current step before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = getValues();
      await loanService.createApplication(formData);
      setSubmitSuccess(true);
      
      // Clear the form data
      resetApplication();
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo />;
      case 2:
        return <Step2EmploymentInfo />;
      case 3:
        return <Step3FinancialInfo />;
      case 4:
        return <Step4LoanDetails />;
      case 5:
        return <Step5PropertyInfo />;
      case 6:
        return <Step6References />;
      default:
        return <Step1PersonalInfo />;
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card className="p-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for submitting your loan application. Our team will review your 
                application and contact you within 2-3 business days.
              </p>
              <p className="text-sm text-gray-500">
                You will be redirected to your dashboard shortly...
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Loan Application
            </h1>
            <div className="max-w-md mx-auto">
              <Progress 
                value={getProgressPercentage()} 
                showLabel 
                className="mb-2" 
              />
              <p className="text-sm text-gray-600">
                Complete all steps to submit your application
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            className="mb-8"
          />

          {/* Form */}
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Current Step Content */}
              <div className="mb-8">
                {renderCurrentStep()}
              </div>

              {/* Error Message */}
              {submitError && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-800 font-medium">Submission Error</p>
                        <p className="text-sm text-red-700 mt-1">{submitError}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSave}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Progress
                      </Button>

                      {currentStep < steps.length ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="flex items-center gap-2"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            'Submitting...'
                          ) : (
                            <>
                              Submit Application
                              <Send className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help? Contact us at <strong>(555) 123-4567</strong> or{' '}
                  <strong>support@lendpro.com</strong>
                </p>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}