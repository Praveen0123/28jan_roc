

export interface EducationFinancingModelDto
{
  isTaxDependent: boolean;
  prefersIncomeBasedRepayment: boolean;
  outOfPocketExpensesByYear: number[];
  federalSubsidizedLoanAmountByYear: number[];
  federalUnsubsidizedLoanAmountByYear: number[];
  cumulativeFederalSubsidizedLoan: number;
  cumulativeFederalUnsubsidizedLoan: number;
  federalLoanAmountByYear: number[];
  privateLoanAmountByYear: number[];
  yearsToPayOffFederalLoan: number;
  yearsToPayOffPrivateLoan: number;
}
