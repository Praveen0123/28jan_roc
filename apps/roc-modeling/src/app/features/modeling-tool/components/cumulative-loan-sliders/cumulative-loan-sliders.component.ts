import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import hash from 'object-hash';

import { OptimizedOutOfPocketLinearPoints } from '@gql';
import { RoiModelDto } from '@app/domain';
import * as loanCalculator from '@app/domain/roi-model/domain/loan-calculator';


export interface CumulativeLoanSlidersOutput
{
  outOfPocketExpensesByYear: number[];
  federalSubsidizedLoanAmountByYear: number[];
  federalUnsubsidizedLoanAmountByYear: number[];
  federalLoanAmountByYear: number[];
  privateLoanAmountByYear: number[];
}

@Component({
  selector: 'roc-cumulative-loan-sliders',
  templateUrl: './cumulative-loan-sliders.component.html',
  styleUrls: ['./cumulative-loan-sliders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CumulativeLoanSlidersComponent implements OnInit, OnChanges
{
  @Input() roiModelDto: RoiModelDto;
  @Output() cumulativeLoanSlidersOutputChange = new EventEmitter<CumulativeLoanSlidersOutput>();

  // inputs
  optimizedOutOfPocketLinearPoints: OptimizedOutOfPocketLinearPoints;
  cumulativeNetPrice: number;
  netPriceByYear: number[];
  cumulativeOutOfPocketExpenses: number;
  cumulativeFederalSubsidizedLoanLimit: number;
  cumulativeFederalUnsubsidizedLoanLimit: number;
  yearsToCompleteDegree: number;
  costOfAttendanceByYear: number[];
  grantOrScholarshipAidByYear: number[];
  isTaxDependent: boolean;
  efc: number;
  fullTimeStudentPercent: number;
  yearsToPayOffFederalLoan: number;
  yearsToPayOffPrivateLoan: number;
  sliderStep: number;

  // outputs
  outOfPocketExpensesByYear: number[];
  federalSubsidizedLoanAmountByYear: number[];
  federalUnsubsidizedLoanAmountByYear: number[];
  federalLoanAmountByYear: number[];
  privateLoanAmountByYear: number[];

  // calculated amounts
  cumulativeFederalSubsidizedLoanAmount: number;
  cumulativeFederalUnsubsidizedLoanAmount: number;
  cumulativeFederalLoanAmount: number;
  cumulativePrivateLoanAmount: number;
  cumulativePellGrantAid: number;

  outputHash: string;


  constructor() { }

  ngOnInit(): void
  {
    this.setLocalVariables();

    const cumulativeLoanSlidersOutput: CumulativeLoanSlidersOutput = {
      outOfPocketExpensesByYear: this.outOfPocketExpensesByYear,
      federalSubsidizedLoanAmountByYear: this.federalSubsidizedLoanAmountByYear,
      federalUnsubsidizedLoanAmountByYear: this.federalUnsubsidizedLoanAmountByYear,
      federalLoanAmountByYear: this.federalLoanAmountByYear,
      privateLoanAmountByYear: this.privateLoanAmountByYear
    };
    this.outputHash = this.toHash(cumulativeLoanSlidersOutput);

    this.onCumulativeOutOfPocketExpensesChange(this.cumulativeOutOfPocketExpenses);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes.roiModelDto && !changes.roiModelDto.firstChange)
    {
      this.setLocalVariables();
      this.onCumulativeOutOfPocketExpensesChange(this.cumulativeOutOfPocketExpenses);
    }
  }

  setLocalVariables()
  {
    this.optimizedOutOfPocketLinearPoints = this.roiModelDto.optimizedOutOfPocketLinearPoints;
    this.isTaxDependent = this.roiModelDto.educationFinancing.isTaxDependent;
    this.outOfPocketExpensesByYear = this.roiModelDto.outOfPocketExpensesByYear;
    this.costOfAttendanceByYear = this.roiModelDto.costOfAttendanceByYear;
    this.grantOrScholarshipAidByYear = this.roiModelDto.grantOrScholarshipAidByYear;

    this.netPriceByYear = this.roiModelDto.netPriceByYear;
    this.cumulativeNetPrice = this.arraySum(this.roiModelDto.netPriceByYear);
    this.cumulativeOutOfPocketExpenses = this.arraySum(this.roiModelDto.outOfPocketExpensesByYear);
    this.cumulativeFederalSubsidizedLoanLimit = this.arraySum(this.roiModelDto.federalSubsidizedLoanLimitByYear);
    this.cumulativeFederalUnsubsidizedLoanLimit = this.arraySum(this.roiModelDto.federalUnsubsidizedLoanLimitByYear);
    this.yearsToCompleteDegree = this.roiModelDto.yearsToCompleteDegree;
    this.efc = this.roiModelDto.expectedFamilyContribution;
    this.fullTimeStudentPercent = this.roiModelDto.isFulltime ? 1 : 0.5;
    this.yearsToPayOffFederalLoan = this.roiModelDto.educationFinancing.yearsToPayOffFederalLoan;
    this.yearsToPayOffPrivateLoan = this.roiModelDto.educationFinancing.yearsToPayOffPrivateLoan;
    this.sliderStep = (this.cumulativeNetPrice * .05);
  }

  onCumulativeOutOfPocketExpensesInput(cumulativeOutOfPocketExpenses: number)
  {
    let outOfPocketExpensesByYear = [];

    if (this.optimizedOutOfPocketLinearPoints)
    {
      for (let i = 0; i < this.yearsToCompleteDegree; i++)
      {
        const outOfPocketExpensesForYear = this.interpolate(this.optimizedOutOfPocketLinearPoints.x[i], this.optimizedOutOfPocketLinearPoints.y[i], cumulativeOutOfPocketExpenses);
        outOfPocketExpensesByYear.push(outOfPocketExpensesForYear);
      }
    } else
    {
      outOfPocketExpensesByYear = this.outOfPocketExpensesByYear;
    }


    const modeledLoansByYear = loanCalculator.calculateLoansByYear(
      this.costOfAttendanceByYear,
      outOfPocketExpensesByYear,
      this.grantOrScholarshipAidByYear,
      this.yearsToCompleteDegree,
      !this.isTaxDependent,
      this.efc
    );

    this.outOfPocketExpensesByYear = outOfPocketExpensesByYear;
    this.federalSubsidizedLoanAmountByYear = modeledLoansByYear.federalSubsidizedLoanAmountByYear;
    this.federalUnsubsidizedLoanAmountByYear = modeledLoansByYear.federalUnsubsidizedLoanAmountByYear;
    this.federalLoanAmountByYear = modeledLoansByYear.federalLoanAmountByYear;
    this.privateLoanAmountByYear = modeledLoansByYear.privateLoanAmountByYear;
    this.privateLoanAmountByYear = modeledLoansByYear.privateLoanAmountByYear;

    this.cumulativeFederalSubsidizedLoanAmount = this.arraySum(this.federalSubsidizedLoanAmountByYear);
    this.cumulativeFederalUnsubsidizedLoanAmount = this.arraySum(this.federalUnsubsidizedLoanAmountByYear);
    this.cumulativeFederalLoanAmount = this.arraySum(this.federalLoanAmountByYear);
    this.cumulativePrivateLoanAmount = this.arraySum(this.privateLoanAmountByYear);

  }

  onCumulativeOutOfPocketExpensesChange(cumulativeOutOfPocketExpenses: number)
  {
    this.onCumulativeOutOfPocketExpensesInput(cumulativeOutOfPocketExpenses);

    const cumulativeLoanSlidersOutput: CumulativeLoanSlidersOutput = {
      outOfPocketExpensesByYear: this.outOfPocketExpensesByYear,
      federalSubsidizedLoanAmountByYear: this.federalSubsidizedLoanAmountByYear,
      federalUnsubsidizedLoanAmountByYear: this.federalUnsubsidizedLoanAmountByYear,
      federalLoanAmountByYear: this.federalLoanAmountByYear,
      privateLoanAmountByYear: this.privateLoanAmountByYear
    };

    const newOutputHash = this.toHash(cumulativeLoanSlidersOutput);

    if (newOutputHash !== this.outputHash)
    {
      this.outputHash = newOutputHash;
      // this.cumulativeLoanSlidersOutputChange.emit(cumulativeLoanSlidersOutput);
    }
  }

  arraySum(numberArray: number[]): number
  {
    return numberArray.reduce((p, c) => p + c, 0);
  };

  private interpolate(x: number[], y: number[], t: number)
  {
    const n = x.length;
    let j;
    let found = false;

    if (t < x[0] || t > x[n - 1])
    {
      j = 0;
      found = true;
    }

    if (t > x[n - 1])
    {
      j = n - 2;
      found = true;
    }

    for (let i = 0; i < n - 1 && !found; i++)
    {
      if (t >= x[i] && t <= x[i + 1])
      {
        j = i;
        found = true;
      }
    }

    if (!found)
    {
      const error1 = 'error in logic';
      throw error1;
    }

    const k = (y[j + 1] - y[j]) / (x[j + 1] - x[j]);
    const result = y[j] + k * (t - x[j]);
    return result;
  };

  private toHash(input: CumulativeLoanSlidersOutput): string
  {
    return hash(input);
  }

}
