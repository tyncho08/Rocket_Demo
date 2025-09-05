import { z } from 'zod';

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssn: z.string()
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
    .transform(val => val.replace(/-/g, '')),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  dependents: z.number().min(0, 'Dependents cannot be negative').max(20, 'Too many dependents'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  currentAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    yearsAtAddress: z.number().min(0, 'Years at address cannot be negative').max(100, 'Invalid years'),
    monthsAtAddress: z.number().min(0, 'Months cannot be negative').max(11, 'Months must be 0-11')
  }),
  previousAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    yearsAtAddress: z.number().optional(),
    monthsAtAddress: z.number().optional()
  }).optional()
});

// Step 2: Employment Information
export const employmentInfoSchema = z.object({
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired', 'student']),
  currentEmployment: z.object({
    employer: z.string().min(2, 'Employer name is required'),
    jobTitle: z.string().min(2, 'Job title is required'),
    yearsEmployed: z.number().min(0, 'Years employed cannot be negative').max(50, 'Invalid years'),
    monthsEmployed: z.number().min(0, 'Months cannot be negative').max(11, 'Months must be 0-11'),
    monthlyIncome: z.number().min(0, 'Monthly income cannot be negative'),
    employerPhone: z.string().min(10, 'Employer phone is required'),
    employerAddress: z.object({
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    })
  }).optional(),
  previousEmployment: z.object({
    employer: z.string().optional(),
    jobTitle: z.string().optional(),
    yearsEmployed: z.number().optional(),
    monthsEmployed: z.number().optional(),
    monthlyIncome: z.number().optional(),
    reasonForLeaving: z.string().optional()
  }).optional(),
  additionalIncome: z.array(z.object({
    source: z.string().min(2, 'Income source is required'),
    amount: z.number().min(0, 'Amount cannot be negative'),
    frequency: z.enum(['monthly', 'quarterly', 'annually'])
  })).optional()
});

// Step 3: Financial Information
export const financialInfoSchema = z.object({
  annualIncome: z.number().min(1000, 'Annual income must be at least $1,000'),
  monthlyDebts: z.number().min(0, 'Monthly debts cannot be negative'),
  assets: z.object({
    checking: z.number().min(0, 'Checking account balance cannot be negative'),
    savings: z.number().min(0, 'Savings account balance cannot be negative'),
    investments: z.number().min(0, 'Investment balance cannot be negative'),
    retirement: z.number().min(0, 'Retirement account balance cannot be negative'),
    otherAssets: z.number().min(0, 'Other assets cannot be negative')
  }),
  liabilities: z.object({
    creditCards: z.number().min(0, 'Credit card debt cannot be negative'),
    autoLoans: z.number().min(0, 'Auto loan debt cannot be negative'),
    studentLoans: z.number().min(0, 'Student loan debt cannot be negative'),
    otherDebts: z.number().min(0, 'Other debts cannot be negative')
  }),
  creditScore: z.number().min(300, 'Credit score too low').max(850, 'Credit score too high').optional(),
  bankruptcyHistory: z.boolean().default(false),
  foreclosureHistory: z.boolean().default(false)
});

// Step 4: Loan Details
export const loanDetailsSchema = z.object({
  loanAmount: z.number().min(1000, 'Loan amount must be at least $1,000'),
  propertyValue: z.number().min(1000, 'Property value must be at least $1,000'),
  downPayment: z.number().min(0, 'Down payment cannot be negative'),
  interestRate: z.number().min(0.1, 'Interest rate too low').max(30, 'Interest rate too high'),
  loanTermYears: z.number().min(1, 'Loan term too short').max(50, 'Loan term too long'),
  loanPurpose: z.enum(['purchase', 'refinance', 'cashout-refinance', 'home-equity']),
  occupancyType: z.enum(['primary', 'secondary', 'investment']),
  cashOutAmount: z.number().min(0).optional()
});

// Step 5: Property Information
export const propertyInfoSchema = z.object({
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
  }),
  propertyType: z.enum(['single-family', 'condo', 'townhouse', 'multi-family', 'manufactured']),
  yearBuilt: z.number().min(1800, 'Year built too old').max(new Date().getFullYear() + 2, 'Year built invalid'),
  squareFeet: z.number().min(100, 'Square footage too small').max(50000, 'Square footage too large'),
  lotSize: z.number().min(0, 'Lot size cannot be negative').optional(),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative').max(20, 'Too many bedrooms'),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative').max(20, 'Too many bathrooms'),
  garage: z.boolean().default(false),
  pool: z.boolean().default(false),
  hasHOA: z.boolean().default(false),
  hoaFees: z.number().min(0, 'HOA fees cannot be negative').optional(),
  propertyTaxes: z.number().min(0, 'Property taxes cannot be negative'),
  homeInsurance: z.number().min(0, 'Home insurance cannot be negative')
});

// Step 6: References
export const referencesSchema = z.object({
  personal: z.array(z.object({
    name: z.string().min(2, 'Name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    yearsKnown: z.number().min(0, 'Years known cannot be negative').max(100, 'Invalid years known')
  })).min(1, 'At least one personal reference is required').max(5, 'Too many personal references'),
  professional: z.array(z.object({
    name: z.string().min(2, 'Name is required'),
    title: z.string().min(2, 'Title is required'),
    company: z.string().min(2, 'Company is required'),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    relationship: z.string().min(2, 'Professional relationship is required')
  })).max(3, 'Too many professional references').optional()
});

// Complete application schema
export const loanApplicationSchema = z.object({
  personalInfo: personalInfoSchema,
  employmentInfo: employmentInfoSchema,
  financialInfo: financialInfoSchema,
  loanDetails: loanDetailsSchema,
  propertyInfo: propertyInfoSchema,
  references: referencesSchema,
  agreements: z.object({
    creditCheck: z.boolean().refine(val => val === true, 'You must agree to credit check'),
    termsAndConditions: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
    privacyPolicy: z.boolean().refine(val => val === true, 'You must agree to privacy policy'),
    electronicCommunication: z.boolean().default(false)
  })
});

export type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type EmploymentInfoData = z.infer<typeof employmentInfoSchema>;
export type FinancialInfoData = z.infer<typeof financialInfoSchema>;
export type LoanDetailsData = z.infer<typeof loanDetailsSchema>;
export type PropertyInfoData = z.infer<typeof propertyInfoSchema>;
export type ReferencesData = z.infer<typeof referencesSchema>;