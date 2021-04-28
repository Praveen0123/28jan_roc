export interface CostOfAttendanceModel
{
  tuitionAndFees: TuitionAndFeesModel;
  booksAndSupplies: CostOfAttendanceBreakdownModel;
  livingArrangement: LivingArrangementModel;
}

export interface TuitionAndFeesModel
{
  inDistrict: CostOfAttendanceBreakdownModel;
  inState: CostOfAttendanceBreakdownModel;
  outOfState: CostOfAttendanceBreakdownModel;
};

export interface CostOfAttendanceBreakdownModel
{
  expenseAmount: number;
  percentChangeFromLastYear: number;
};

export interface LivingArrangementModel
{
  onCampus: NotWithFamilyLivingArrangementBreakdownModel;
  offCampusNotWithFamily: NotWithFamilyLivingArrangementBreakdownModel;
  offCampusWithFamily: WithFamilyLivingArrangementBreakdownModel;
};

export interface NotWithFamilyLivingArrangementBreakdownModel
{
  roomAndBoard: CostOfAttendanceBreakdownModel;
  otherExpenses: CostOfAttendanceBreakdownModel;
};

export interface WithFamilyLivingArrangementBreakdownModel
{
  otherExpenses: CostOfAttendanceBreakdownModel;
};

export interface AvgGrantScholarshipAidBreakdownModel
{
  numberReceivingAid: number;
  avgAmountAidReceived: number;
  federalGrants: FederalGrantsModel;
  stateLocalGovtGrantOrScholarships: AidBreakdownModel;
  institutionalGrantsOrScholarships: AidBreakdownModel;
};

export interface FederalGrantsModel
{
  numberReceivingAid: number;
  avgAmountAidReceived: number;
  pellGrants: AidBreakdownModel;
  otherFederalGrants: AidBreakdownModel;
};

export interface AidBreakdownModel
{
  numberReceivingAid: number;
  avgAmountAidReceived: number;
};

export interface AvgGrantScholarshipAidByIncomeModel
{
  income0To30000: number;
  income30001To48000: number;
  income48001To75000: number;
  income75001To110000: number;
  incomeOver110000: number;
};

export interface GrantsModel
{
  federalPellGrant: number;
  otherFederalGrants: number;
  stateOrLocalGrants: number;
  institutionalGrants: number;
  otherGrants: number;
  giBillBenefits: number;
  dodTuitionAssistance: number;
}

export interface LoanLimitsModel
{
  federalSubsidizedLoanByYear: number[];
  federalUnsubsidizedLoanByYear: number[];
  cumulativeFederalSubsidizedLoan: number;
  cumulativeFederalUnsubsidizedLoan: number;
}

export interface RocModelCloneDataToKeepModel
{
  modelName: string;
  isGoalLocationCloned: boolean;
  isGoalOccupationCloned: boolean;
  isGoalDegreeLevelCloned: boolean;
  isGoalDegreeProgramCloned: boolean;
  isGoalRetirementAgeCloned: boolean;
  isEducationCostInstitutionCloned: boolean;
  isEducationCostStartSchoolCloned: boolean;
  isEducationCostPartTimeFullTimeCloned: boolean;
  isEducationCostYearsToCompleteCloned: boolean;
}

export interface CostLineItem
{
  expenseAmount: number,
  percentChangeFromLastYear: number;
}

export interface CostOfAttendanceSummary
{
  tuitionAndFees: CostLineItem;
  booksAndSupplies: CostLineItem;
  roomAndBoard: CostLineItem;
  otherLivingExpenses: CostLineItem;
  totalExpense: number;
}
