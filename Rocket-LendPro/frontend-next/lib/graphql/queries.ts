import { gql } from '@apollo/client';

export const SEARCH_PROPERTIES_QUERY = gql`
  query SearchProperties($first: Int, $after: String, $search: PropertySearchInput) {
    properties(first: $first, after: $after, search: $search) {
      edges {
        node {
          id
          address
          city
          state
          zipCode
          price
          bedrooms
          bathrooms
          squareFeet
          propertyType
          description
          imageUrl
          listedDate
          isFavorite
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PROPERTY_QUERY = gql`
  query GetProperty($id: Int!) {
    property(id: $id) {
      id
      address
      city
      state
      zipCode
      price
      bedrooms
      bathrooms
      squareFeet
      propertyType
      description
      imageUrl
      listedDate
      isFavorite
    }
  }
`;

export const GET_FAVORITE_PROPERTIES_QUERY = gql`
  query GetFavoriteProperties {
    favoriteProperties {
      id
      address
      city
      state
      zipCode
      price
      bedrooms
      bathrooms
      squareFeet
      propertyType
      imageUrl
      listedDate
      isActive
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
      errors {
        message
        code
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
      errors {
        message
        code
      }
    }
  }
`;

export const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavoriteProperty($propertyId: Int!) {
    toggleFavoriteProperty(propertyId: $propertyId) {
      property {
        id
        isFavorite
      }
      isFavorite
      errors {
        message
        code
      }
    }
  }
`;

export const CREATE_LOAN_APPLICATION_MUTATION = gql`
  mutation CreateLoanApplication($input: CreateLoanApplicationInput!) {
    createLoanApplication(input: $input) {
      loanApplication {
        id
        loanAmount
        propertyValue
        downPayment
        status
        createdAt
      }
      errors {
        message
        code
      }
    }
  }
`;

export const GET_MY_LOAN_APPLICATIONS_QUERY = gql`
  query GetMyLoanApplications($first: Int) {
    myLoanApplications(first: $first) {
      edges {
        node {
          id
          loanAmount
          propertyValue
          downPayment
          interestRate
          loanTermYears
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const CALCULATE_MORTGAGE_QUERY = gql`
  query CalculateMortgage($input: MortgageCalculationInput!) {
    calculateMortgage(input: $input) {
      monthlyPayment
      totalInterest
      totalPayment
      amortizationSchedule {
        paymentNumber
        paymentAmount
        principalAmount
        interestAmount
        remainingBalance
      }
    }
  }
`;

export const GET_LOCATIONS_QUERY = gql`
  query GetLocations {
    locations {
      states
      cities
    }
  }
`;

// Auth Queries
export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      role
      createdAt
      updatedAt
    }
  }
`;

// Enhanced Mortgage Queries
export const CHECK_PRE_APPROVAL_QUERY = gql`
  query CheckPreApproval($input: PreApprovalInput!) {
    checkPreApproval(input: $input) {
      isEligible
      maxLoanAmount
      estimatedRate
      message
    }
  }
`;

export const ANALYZE_REFINANCE_QUERY = gql`
  query AnalyzeRefinance($input: RefinanceInput!) {
    analyzeRefinance(input: $input) {
      currentPayment
      newPayment
      monthlySavings
      breakEvenMonths
      totalSavings
      isRecommended
      recommendation
    }
  }
`;

export const CALCULATE_AFFORDABILITY_QUERY = gql`
  query CalculateAffordability($input: AffordabilityInput!) {
    calculateAffordability(input: $input) {
      maxLoanAmount
      maxHomePrice
      recommendedPayment
      debtToIncomeRatio
      isAffordable
    }
  }
`;

// Admin Queries
export const GET_DASHBOARD_METRICS_QUERY = gql`
  query GetDashboardMetrics {
    dashboardMetrics {
      totalApplications
      pendingApplications
      approvedApplications
      rejectedApplications
      totalUsers
      newUsersThisMonth
      recentApplications {
        id
        userName
        loanAmount
        status
        createdAt
      }
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers($first: Int, $after: String, $search: AdminSearchInput) {
    users(first: $first, after: $after, search: $search) {
      edges {
        node {
          id
          firstName
          lastName
          email
          role
          createdAt
          updatedAt
          loanApplications {
            id
            status
            loanAmount
            createdAt
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_ALL_LOAN_APPLICATIONS_QUERY = gql`
  query GetAllLoanApplications($first: Int, $after: String, $search: AdminSearchInput) {
    allLoanApplications(first: $first, after: $after, search: $search) {
      edges {
        node {
          id
          userId
          loanAmount
          propertyValue
          downPayment
          interestRate
          loanTermYears
          annualIncome
          employmentStatus
          employer
          status
          notes
          createdAt
          updatedAt
          user {
            firstName
            lastName
            email
          }
          documents {
            id
            documentType
            fileName
            fileSize
            uploadedAt
          }
          payments {
            id
            amount
            paymentDate
            status
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_LOAN_APPLICATION_QUERY = gql`
  query GetLoanApplication($id: Int!) {
    loanApplication(id: $id) {
      id
      userId
      loanAmount
      propertyValue
      downPayment
      interestRate
      loanTermYears
      annualIncome
      employmentStatus
      employer
      status
      notes
      createdAt
      updatedAt
      user {
        firstName
        lastName
        email
      }
      documents {
        id
        documentType
        fileName
        fileSize
        uploadedAt
        fileSizeFormatted
      }
      payments {
        id
        amount
        paymentDate
        status
      }
      monthlyPayment
    }
  }
`;

// Additional Mutations
export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      user {
        id
        firstName
        lastName
        email
        role
        updatedAt
      }
      errors {
        message
        code
      }
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      user {
        id
        updatedAt
      }
      errors {
        message
        code
      }
    }
  }
`;

export const UPDATE_LOAN_APPLICATION_STATUS_MUTATION = gql`
  mutation UpdateLoanApplicationStatus($input: UpdateLoanStatusInput!) {
    updateLoanApplicationStatus(input: $input) {
      loanApplication {
        id
        status
        notes
        updatedAt
        user {
          firstName
          lastName
          email
        }
      }
      errors {
        message
        code
      }
    }
  }
`;

export const UPLOAD_LOAN_DOCUMENT_MUTATION = gql`
  mutation UploadLoanDocument($input: UploadDocumentInput!) {
    uploadLoanDocument(input: $input) {
      document {
        id
        loanApplicationId
        documentType
        fileName
        fileSize
        uploadedAt
        fileSizeFormatted
      }
      errors {
        message
        code
      }
    }
  }
`;

export const DELETE_LOAN_DOCUMENT_MUTATION = gql`
  mutation DeleteLoanDocument($documentId: Int!) {
    deleteLoanDocument(documentId: $documentId) {
      success
      errors {
        message
        code
      }
    }
  }
`;