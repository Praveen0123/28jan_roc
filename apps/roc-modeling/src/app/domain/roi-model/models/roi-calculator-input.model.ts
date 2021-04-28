export interface RoiCalculatorInput
{
  currentZipCode: string;
  goalZipCode: string;
  distance: number;
  currentStateOnetCode: string[];
  currentStateOccupationTitle: string;
  goalStateOnetCode: string[];
  goalStateOccupationTitle: string;
  startDegreeLevel: number;
  endDegreeLevel: number;
  yearsOfCollege: number;
  yearsToRetirement: number;
  independent: boolean;
  ibrFederal: boolean;
  monthsToPayoffFederalLoan: number;
  monthsToPayoffPrivateLoan: number;
  costOfAttendanceByYear: number[];
  outOfPocketExpensesByYear: number[];
  grantOrScholarshipAidByYear: number[];
  federalSubsidizedLoanAmountByYear: number[];
  federalUnsubsidizedLoanAmountByYear: number[];
  privateLoanAmountByYear: number[];
  federalLoanInterest: number;
  privateLoanInterest: number;
  isFulltime: boolean;
  workDuringStudy: boolean;
  ipedsGraduationTimeFactor: number[];
  ipedsGraduationProbability: number[];
  ipedsRetentionRate: number[];
  startingYearDelay: number;
  noLoans: boolean;
}
