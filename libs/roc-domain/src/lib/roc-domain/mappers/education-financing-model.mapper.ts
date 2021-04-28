import { IMapper, Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../config/config';
import { EducationFinancingModel } from '../domain';
import { EducationFinancingModelDto } from '../models';


export class EducationFinancingModelMapper implements IMapper<EducationFinancingModel, EducationFinancingModelDto>
{
  private constructor()
  {
  }

  public static create(): EducationFinancingModelMapper
  {
    return new EducationFinancingModelMapper();
  }

  toDTO(input: EducationFinancingModel): EducationFinancingModelDto
  {
    const dto: EducationFinancingModelDto =
    {
      isTaxDependent: input.isTaxDependent,
      prefersIncomeBasedRepayment: input.prefersIncomeBasedRepayment,
      outOfPocketExpensesByYear: input.outOfPocketExpensesByYear,
      federalSubsidizedLoanAmountByYear: input.federalSubsidizedLoanAmountByYear,
      federalUnsubsidizedLoanAmountByYear: input.federalUnsubsidizedLoanAmountByYear,
      cumulativeFederalSubsidizedLoan: (input.isTaxDependent) ? CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_SUBSIDIZED.TOTAL : CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_SUBSIDIZED.TOTAL,
      cumulativeFederalUnsubsidizedLoan: (input.isTaxDependent) ? CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_UNSUBSIDIZED.TOTAL : CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_UNSUBSIDIZED.TOTAL,
      federalLoanAmountByYear: input.federalLoanAmountByYear,
      privateLoanAmountByYear: input.privateLoanAmountByYear,
      yearsToPayOffFederalLoan: input.yearsToPayOffFederalLoan,
      yearsToPayOffPrivateLoan: input.yearsToPayOffPrivateLoan
    };

    return dto;
  }

  toDomain(input: EducationFinancingModelDto): Result<EducationFinancingModel>
  {
    return EducationFinancingModel.create
      (
        {
          isTaxDependent: input?.isTaxDependent ?? EducationFinancingModel.defaultProps.isTaxDependent,
          prefersIncomeBasedRepayment: input?.prefersIncomeBasedRepayment ?? EducationFinancingModel.defaultProps.prefersIncomeBasedRepayment,
          outOfPocketExpensesByYear: input?.outOfPocketExpensesByYear ?? EducationFinancingModel.defaultProps.outOfPocketExpensesByYear,
          federalSubsidizedLoanAmountByYear: input?.federalSubsidizedLoanAmountByYear ?? EducationFinancingModel.defaultProps.federalSubsidizedLoanAmountByYear,
          federalUnsubsidizedLoanAmountByYear: input?.federalUnsubsidizedLoanAmountByYear ?? EducationFinancingModel.defaultProps.federalUnsubsidizedLoanAmountByYear,
          cumulativeFederalSubsidizedLoan: input?.cumulativeFederalSubsidizedLoan ?? EducationFinancingModel.defaultProps.cumulativeFederalSubsidizedLoan,
          cumulativeFederalUnsubsidizedLoan: input?.cumulativeFederalUnsubsidizedLoan ?? EducationFinancingModel.defaultProps.cumulativeFederalUnsubsidizedLoan,
          federalLoanAmountByYear: input?.federalLoanAmountByYear ?? EducationFinancingModel.defaultProps.federalLoanAmountByYear,
          privateLoanAmountByYear: input?.privateLoanAmountByYear ?? EducationFinancingModel.defaultProps.privateLoanAmountByYear,
          yearsToPayOffFederalLoan: input?.yearsToPayOffFederalLoan ?? EducationFinancingModel.defaultProps.yearsToPayOffFederalLoan,
          yearsToPayOffPrivateLoan: input?.yearsToPayOffPrivateLoan ?? EducationFinancingModel.defaultProps.yearsToPayOffPrivateLoan
        }
      );
  }
}
