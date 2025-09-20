export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password'
  },
  dashboard: {
    overview: '/dashboard',
  },
  forms: {
    AddProject: '/Forms/project',
    adduser: '/Forms/usermanagement',
    AddRequest: '/Forms/request',
  },
  reports: {
    userHistory: '/reports/userHistory',
    transactionsHistory: '/reports/transactionHistory',
  },
  errors: {
    notFound: '/errors/not-found'
  },
} as const;
