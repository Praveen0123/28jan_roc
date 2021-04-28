import { Entity, Guard, Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../../config/config';


export interface EducationFinancingModelProps
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

export class EducationFinancingModel extends Entity<EducationFinancingModelProps>
{
  get isTaxDependent(): boolean
  {
    return this.props.isTaxDependent;
  }
  get prefersIncomeBasedRepayment(): boolean
  {
    return this.props.prefersIncomeBasedRepayment;
  }
  get outOfPocketExpensesByYear(): number[]
  {
    return this.props.outOfPocketExpensesByYear;
  }
  get federalSubsidizedLoanAmountByYear(): number[]
  {
    return this.props.federalSubsidizedLoanAmountByYear;
  }
  get federalUnsubsidizedLoanAmountByYear(): number[]
  {
    return this.props.federalUnsubsidizedLoanAmountByYear;
  }
  get cumulativeFederalSubsidizedLoan(): number
  {
    return this.props.cumulativeFederalSubsidizedLoan;
  }
  get cumulativeFederalUnsubsidizedLoan(): number
  {
    return this.props.cumulativeFederalUnsubsidizedLoan;
  }
  get federalLoanAmountByYear(): number[]
  {
    return this.props.federalLoanAmountByYear;
  }
  get privateLoanAmountByYear(): number[]
  {
    return this.props.privateLoanAmountByYear;
  }
  get yearsToPayOffFederalLoan(): number
  {
    return this.props.yearsToPayOffFederalLoan;
  }
  get yearsToPayOffPrivateLoan(): number
  {
    return this.props.yearsToPayOffPrivateLoan;
  }


  private constructor(props: EducationFinancingModelProps)
  {
    super(props);
  }

  static create(props: EducationFinancingModelProps): Result<EducationFinancingModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk(
      [
      ]);

    if (!propsResult.succeeded)
    {
      return Result.failure<EducationFinancingModel>(propsResult.message || 'education financing properties error');
    }

    const careerGoal = new EducationFinancingModel
      (
        {
          ...props
        }
      );

    return Result.success<EducationFinancingModel>(careerGoal);
  }

  static get defaultProps(): EducationFinancingModelProps
  {
    const props: EducationFinancingModelProps =
    {
      isTaxDependent: true,
      prefersIncomeBasedRepayment: false,
      outOfPocketExpensesByYear: null,
      federalSubsidizedLoanAmountByYear: [0],
      federalUnsubsidizedLoanAmountByYear: [0],
      cumulativeFederalSubsidizedLoan: CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_SUBSIDIZED.TOTAL,
      cumulativeFederalUnsubsidizedLoan: CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_UNSUBSIDIZED.TOTAL,
      federalLoanAmountByYear: [0],
      privateLoanAmountByYear: [0],
      yearsToPayOffFederalLoan: CONFIG.EDUCATION_FINANCING.DEFAULT_PAY_OFF_FEDERAL_LOAN_IN_YEARS,
      yearsToPayOffPrivateLoan: CONFIG.EDUCATION_FINANCING.DEFAULT_PAY_OFF_PRIVATE_LOAN_IN_YEARS
    };

    return props;
  }


  clearEducationFinancing()
  {
    this.props.prefersIncomeBasedRepayment = false;
    this.props.outOfPocketExpensesByYear = null;
    this.props.federalSubsidizedLoanAmountByYear = [0];
    this.props.federalUnsubsidizedLoanAmountByYear = [0];
    this.props.federalLoanAmountByYear = [0];
    this.props.privateLoanAmountByYear = [0];
    this.props.yearsToPayOffFederalLoan = CONFIG.EDUCATION_FINANCING.DEFAULT_PAY_OFF_FEDERAL_LOAN_IN_YEARS;
    this.props.yearsToPayOffPrivateLoan = CONFIG.EDUCATION_FINANCING.DEFAULT_PAY_OFF_PRIVATE_LOAN_IN_YEARS;
  }
}
