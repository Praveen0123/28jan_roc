import { CONFIG } from '@app/config/config';
import { CareerGoalPathEnum, EducationLevelEnum, IncomeRangeEnum, LivingConditionTypeEnum, ResidencyTypeEnum } from '@app/core/models';
import { Institution, InstructionalProgram, Location, Occupation, OptimizedOutOfPocketLinearPoints, OptimizedOutOfPocketLinearPointsQueryVariables } from '@gql';
import { Entity, Guard, Result } from '@vantage-point/ddd-core';
import hash from 'object-hash';

import { RoiCalculatorInput, RoiCalculatorOutputModel } from '../models';
import { EducationFinancing } from './education-financing.model';
import * as loanCalculator from './loan-calculator';
import { RoiModelId } from './roi-model-id';
import { UserModel } from './user-model';


export interface ModelProps
{
  userModel: UserModel;
  name: string;

  location: Location;
  occupation: Occupation;
  degreeLevel: EducationLevelEnum;
  degreeProgram: InstructionalProgram;
  retirementAge: number;
  careerGoalPathType: CareerGoalPathEnum;

  institution: Institution;
  startYear: number;
  familyIncomeRange: IncomeRangeEnum;
  isFulltime: boolean;
  yearsToCompleteDegree: number;

  residencyType: ResidencyTypeEnum;
  livingConditionTypeEnum: LivingConditionTypeEnum;
  costOfAttendance: CostOfAttendance;
  grantsAndScholarships: GrantsAndScholarships;
  expectedFamilyContribution: number;

  optimizedOutOfPocketLinearPointsInput: OptimizedOutOfPocketLinearPointsQueryVariables;
  optimizedOutOfPocketLinearPoints: OptimizedOutOfPocketLinearPoints;
  educationFinancing?: EducationFinancing;

  radiusInMiles?: number;
}

export interface CostOfAttendance
{
  tuitionAndFees: number;
  booksAndSupplies: number;
  roomAndBoard: number;
  otherExpenses: number;
}

export interface GrantsAndScholarships
{
  federalPellGrant: number;
  otherFederalGrants: number;
  stateOrLocalGrants: number;
  institutionalGrants: number;
  otherGrants: number;
  giBillBenefits: number;
  dodTuitionAssistance: number;
}

export class Model extends Entity<ModelProps>
{
  /* #region  PROPERTIES */
  private _roiModelId: RoiModelId;
  private _roiCalculatorInput: RoiCalculatorInput;
  private _roiCalculatorInputHash: string;
  private _roiCalculatorOutput: RoiCalculatorOutputModel;
  private _optimizedOutOfPocketLinearPointsInputHash: string;

  get roiModelId(): RoiModelId
  {
    return this._roiModelId;
  }
  get name(): string
  {
    return this.props.name;
  }

  get location(): Location
  {
    return this.props.location;
  }
  get occupation(): Occupation
  {
    return this.props.occupation;
  }
  get degreeLevel(): EducationLevelEnum
  {
    return this.props.degreeLevel;
  }
  get degreeProgram(): InstructionalProgram
  {
    return this.props.degreeProgram;
  }
  get retirementAge(): number
  {
    return this.props.retirementAge;
  }
  get careerGoalPathType(): CareerGoalPathEnum
  {
    return this.props.careerGoalPathType;
  }

  get institution(): Institution
  {
    return this.props.institution;
  }
  get institutionName(): string
  {
    return this.props.institution.name;
  }
  get startYear(): number
  {
    return this.props.startYear;
  }
  get familyIncomeRange(): IncomeRangeEnum
  {
    return this.props.familyIncomeRange;
  }
  get isFulltime(): boolean
  {
    return this.props.isFulltime;
  }
  get yearsToCompleteDegree(): number
  {
    return this.props.yearsToCompleteDegree;
  }
  get fullTimeStudentPercent(): number
  {
    return (this.props.isFulltime ?? true) ? 1 : 0.5;
  }

  get residencyType(): ResidencyTypeEnum
  {
    return this.props.residencyType;
  }
  get livingConditionTypeEnum(): LivingConditionTypeEnum
  {
    return this.props.livingConditionTypeEnum;
  }
  get costOfAttendance(): CostOfAttendance
  {
    return this.props.costOfAttendance;
  }
  get grantsAndScholarships(): GrantsAndScholarships
  {
    return this.props.grantsAndScholarships;
  }
  get expectedFamilyContribution(): number
  {
    return this.props.expectedFamilyContribution;
  }

  get educationFinancing(): EducationFinancing
  {
    return this.props.educationFinancing;
  }

  get radiusInMiles(): number
  {
    return this.props.radiusInMiles;
  }

  get roiCalculatorInput(): RoiCalculatorInput
  {
    return this._roiCalculatorInput;
  }
  get roiCalculatorOutput(): RoiCalculatorOutputModel
  {
    return this._roiCalculatorOutput;
  }

  get optimizedOutOfPocketLinearPointsInput(): OptimizedOutOfPocketLinearPointsQueryVariables
  {
    return this.props.optimizedOutOfPocketLinearPointsInput;
  }
  get optimizedOutOfPocketLinearPoints(): OptimizedOutOfPocketLinearPoints
  {
    return this.props.optimizedOutOfPocketLinearPoints;
  }

  /* #endregion */


  private constructor(props: ModelProps, roiModelId?: RoiModelId)
  {
    super(props, roiModelId?.id);

    this._roiModelId = RoiModelId.create(this._id);
  }

  static create(props: ModelProps, userModel: UserModel, id?: RoiModelId): Result<Model>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<Model>(propsResult.message || 'roi model properties error');
    }

    const roiModel = new Model
      (
        {
          ...props,
          userModel: userModel
        },
        id
      );

    return Result.success<Model>(roiModel);
  }

  static get defaultProps(): ModelProps
  {
    const educationFinancingOrError: Result<EducationFinancing> = EducationFinancing.create(EducationFinancing.defaultProps);

    const props: ModelProps =
    {
      userModel: null,
      name: 'Default ROI Model',

      location: null,
      occupation: null,
      degreeLevel: EducationLevelEnum.HighSchoolGraduate,
      degreeProgram: null,
      retirementAge: CONFIG.CAREER_GOAL.DEFAULT_RETIREMENT_AGE,
      careerGoalPathType: CareerGoalPathEnum.ExploreCareers,

      institution: null,
      startYear: new Date().getFullYear(),
      familyIncomeRange: null,
      isFulltime: true,
      yearsToCompleteDegree: CONFIG.EDUCATION_COST.YEARS_TO_COMPLETE_DEFAULT,

      residencyType: ResidencyTypeEnum.UNKNOWN,
      livingConditionTypeEnum: LivingConditionTypeEnum.UNKNOWN,
      costOfAttendance: null,
      grantsAndScholarships: null,
      expectedFamilyContribution: null,

      optimizedOutOfPocketLinearPointsInput: null,
      optimizedOutOfPocketLinearPoints: null,
      educationFinancing: (educationFinancingOrError.isSuccess) ? educationFinancingOrError.getValue() : null,

      radiusInMiles: CONFIG.USER_PROFILE.RADIUS_IN_MILES
    };

    return props;
  }


  updateModelName(name: string)
  {
    this.props.name = name;
  }

  updateModelUser(userModel: UserModel)
  {
    this.props.userModel = userModel;
    this.businessRules_Run_All();
  }


  /* #region  CALCULATIONS  */

  tuitionAndFeesInfo(): { expenseAmount: number, percentChangeFromLastYear: number; }
  {
    // default to in-state if residencyType null or UNKNOWN
    const tuitionAndFeesInfo = this.props?.institution?.costOfAttendanceInfo.tuitionAndFees;
    const residencyType = this.props?.residencyType ?? ResidencyTypeEnum.IN_STATE;

    let tuitionAndFees = 0;
    let tuitionAndFeesRaise = 0;

    if (tuitionAndFeesInfo)
    {
      switch (residencyType)
      {
        case ResidencyTypeEnum.UNKNOWN:
        case ResidencyTypeEnum.IN_STATE:
          tuitionAndFees = tuitionAndFeesInfo.inState.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesInfo.inState.percentChangeFromLastYear;
          break;
        case ResidencyTypeEnum.IN_DISTRICT:
          tuitionAndFees = tuitionAndFeesInfo.inDistrict.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesInfo.inDistrict.percentChangeFromLastYear;
          break;
        case ResidencyTypeEnum.OUT_STATE:
          tuitionAndFees = tuitionAndFeesInfo.outOfState.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesInfo.outOfState.percentChangeFromLastYear;
          break;
        default:
          tuitionAndFees = tuitionAndFeesInfo.inState.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesInfo.inState.percentChangeFromLastYear;
          break;
      }

      // if falsey values, fall ball to other residency values
      if (!tuitionAndFees)
      {
        tuitionAndFees = tuitionAndFeesInfo.inDistrict.expenseAmount
          ?? tuitionAndFeesInfo.inState.expenseAmount
          ?? tuitionAndFeesInfo.outOfState.expenseAmount
          ?? 0;
      }
      if (!tuitionAndFeesRaise)
      {
        tuitionAndFeesRaise = tuitionAndFeesInfo.inDistrict.percentChangeFromLastYear
          ?? tuitionAndFeesInfo.inState.percentChangeFromLastYear
          ?? tuitionAndFeesInfo.outOfState.percentChangeFromLastYear
          ?? 0;
      }
    }

    return { expenseAmount: tuitionAndFees, percentChangeFromLastYear: tuitionAndFeesRaise / 100 };
  }
  booksAndSuppliesInfo(): { expenseAmount: number, percentChangeFromLastYear: number; }
  {
    const booksAndSuppliesInfo = this.props?.institution?.costOfAttendanceInfo.booksAndSupplies;
    return { expenseAmount: booksAndSuppliesInfo?.expenseAmount ?? 0, percentChangeFromLastYear: (booksAndSuppliesInfo?.percentChangeFromLastYear ?? 0) / 100 };
  }
  roomAndBoardInfo(): { expenseAmount: number, percentChangeFromLastYear: number; }
  {
    // default to on campus if livingConditionType null or UNKNOWN
    const livingArrangementCostInfo = this.props?.institution?.costOfAttendanceInfo.livingArrangement;
    const livingConditionType = this.props?.livingConditionTypeEnum ?? LivingConditionTypeEnum.ON_CAMPUS;
    let roomAndBoardCost = 0;
    let roomAndBoardCostRaise = 0;

    if (livingArrangementCostInfo)
    {
      switch (livingConditionType)
      {
        case LivingConditionTypeEnum.UNKNOWN:
        case LivingConditionTypeEnum.ON_CAMPUS:
          roomAndBoardCost = livingArrangementCostInfo.onCampus.roomAndBoard.expenseAmount;
          roomAndBoardCostRaise = livingArrangementCostInfo.onCampus.roomAndBoard.percentChangeFromLastYear;
          break;
        case LivingConditionTypeEnum.OFF_CAMPUS_NOT_WITH_FAMILY:
          roomAndBoardCost = livingArrangementCostInfo.offCampusNotWithFamily.roomAndBoard.expenseAmount;
          roomAndBoardCostRaise = livingArrangementCostInfo.offCampusNotWithFamily.roomAndBoard.percentChangeFromLastYear;
          break;
        case LivingConditionTypeEnum.OFF_CAMPUS_WITH_FAMILY:
          roomAndBoardCost = 0;
          roomAndBoardCostRaise = 0;
          break;
        default:
          roomAndBoardCost = livingArrangementCostInfo.onCampus.roomAndBoard.expenseAmount;
          roomAndBoardCostRaise = livingArrangementCostInfo.onCampus.roomAndBoard.percentChangeFromLastYear;
          break;
      }

      // if falsey values, fall ball to other residency values
      if (!roomAndBoardCost)
      {
        roomAndBoardCost = livingArrangementCostInfo.onCampus.roomAndBoard.expenseAmount
          ?? livingArrangementCostInfo.offCampusNotWithFamily.roomAndBoard.expenseAmount
          ?? 0;
      }
      if (!roomAndBoardCostRaise)
      {
        roomAndBoardCostRaise = livingArrangementCostInfo.onCampus.roomAndBoard.percentChangeFromLastYear
          ?? livingArrangementCostInfo.offCampusNotWithFamily.roomAndBoard.percentChangeFromLastYear
          ?? 0;
      }
    }

    return { expenseAmount: roomAndBoardCost, percentChangeFromLastYear: roomAndBoardCostRaise / 100 };
  }
  otherLivingExpensesInfo(): { expenseAmount: number, percentChangeFromLastYear: number; }
  {
    // default to on campus if livingConditionType null or UNKNOWN
    const livingArrangementCostInfo = this.props?.institution?.costOfAttendanceInfo.livingArrangement;
    const livingConditionType = this.props?.livingConditionTypeEnum ?? LivingConditionTypeEnum.ON_CAMPUS;
    let otherLivingExpenses = 0;
    let otherLivingExpensesRaise = 0;

    if (livingArrangementCostInfo)
    {
      switch (livingConditionType)
      {
        case LivingConditionTypeEnum.UNKNOWN:
        case LivingConditionTypeEnum.ON_CAMPUS:
          otherLivingExpenses = livingArrangementCostInfo.onCampus.otherExpenses.expenseAmount;
          otherLivingExpensesRaise = livingArrangementCostInfo.onCampus.otherExpenses.percentChangeFromLastYear;
          break;
        case LivingConditionTypeEnum.OFF_CAMPUS_NOT_WITH_FAMILY:
          otherLivingExpenses = livingArrangementCostInfo.offCampusNotWithFamily.otherExpenses.expenseAmount;
          otherLivingExpensesRaise = livingArrangementCostInfo.offCampusNotWithFamily.otherExpenses.percentChangeFromLastYear;
          break;
        case LivingConditionTypeEnum.OFF_CAMPUS_WITH_FAMILY:
          otherLivingExpenses = livingArrangementCostInfo.offCampusWithFamily.otherExpenses.expenseAmount;
          otherLivingExpensesRaise = livingArrangementCostInfo.offCampusWithFamily.otherExpenses.percentChangeFromLastYear;
          break;
        default:
          otherLivingExpenses = livingArrangementCostInfo.onCampus.otherExpenses.expenseAmount;
          otherLivingExpensesRaise = livingArrangementCostInfo.onCampus.otherExpenses.percentChangeFromLastYear;
          break;
      }

      // if falsey values, fall ball to other residency values
      if (!otherLivingExpenses)
      {
        otherLivingExpenses = livingArrangementCostInfo.onCampus.otherExpenses.expenseAmount
          ?? livingArrangementCostInfo.offCampusNotWithFamily.otherExpenses.expenseAmount
          ?? livingArrangementCostInfo.offCampusWithFamily.otherExpenses.expenseAmount
          ?? 0;
      }
      if (!otherLivingExpensesRaise)
      {
        otherLivingExpensesRaise = livingArrangementCostInfo.onCampus.otherExpenses.percentChangeFromLastYear
          ?? livingArrangementCostInfo.offCampusNotWithFamily.otherExpenses.percentChangeFromLastYear
          ?? livingArrangementCostInfo.offCampusWithFamily.otherExpenses.percentChangeFromLastYear
          ?? 0;
      }
    }

    return { expenseAmount: otherLivingExpenses, percentChangeFromLastYear: otherLivingExpensesRaise / 100 };
  }
  getCostOfAttendanceByYear(usePercentChangeFromLastYear = false): number[]
  {
    const tuitionAndFeesInfo = this.tuitionAndFeesInfo();
    const booksAndSuppliesInfo = this.booksAndSuppliesInfo();
    const roomAndBoardInfo = this.roomAndBoardInfo();
    const otherLivingExpensesInfo = this.otherLivingExpensesInfo();
    const startingYearDelay = this.getStartingYearDelay();

    if (usePercentChangeFromLastYear)
    {
      const costOfAttendanceByYear = loanCalculator.getCostOfAttendanceByYear
        (
          {
            tuitionAndFees: tuitionAndFeesInfo.expenseAmount,
            tuitionAndFeesRaise: tuitionAndFeesInfo.percentChangeFromLastYear,
            booksAndSupplies: booksAndSuppliesInfo.expenseAmount,
            booksAndSuppliesRaise: booksAndSuppliesInfo.percentChangeFromLastYear,
            roomAndBoard: roomAndBoardInfo.expenseAmount,
            roomAndBoardRaise: roomAndBoardInfo.percentChangeFromLastYear,
            otherLivingExpenses: otherLivingExpensesInfo.expenseAmount,
            otherLivingExpensesRaise: otherLivingExpensesInfo.percentChangeFromLastYear
          },
          this.yearsToCompleteDegree, startingYearDelay
        );

      return costOfAttendanceByYear;
    } else
    {
      const costOfAttendanceByYear = [];
      const costOfAttendanceForYear1 = tuitionAndFeesInfo.expenseAmount + booksAndSuppliesInfo.expenseAmount + roomAndBoardInfo.expenseAmount + otherLivingExpensesInfo.expenseAmount;
      for (let index = 0; index < this.yearsToCompleteDegree; index++)
      {
        costOfAttendanceByYear.push(costOfAttendanceForYear1 * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
      }
      return costOfAttendanceByYear;
    }
  }
  getCumulativeCostOfAttendance(): number
  {
    return this.getCostOfAttendanceByYear().reduce((p, c) => p + c, 0);
  }
  getTotalLoanAmount(): number
  {
    const totalFederalLoans = (this.props.educationFinancing?.federalLoanAmountByYear ?? []).reduce((p, c) => p + c, 0);
    const totalPrivateLoans = (this.props.educationFinancing?.privateLoanAmountByYear ?? []).reduce((p, c) => p + c, 0);
    return totalFederalLoans + totalPrivateLoans;
  }
  getGrantOrScholarshipAidByYear(): number[]
  {
    if (this.props.expectedFamilyContribution !== null)
    {
      return this.getGrantOrScholarshipAidByYearStrategy1();
    }
    else if (this.props.familyIncomeRange !== null && this.props.familyIncomeRange.key !== IncomeRangeEnum.UNKNOWN.key)
    {
      return this.getGrantOrScholarshipAidByYearStrategy2();
    }
    else
    {
      return this.getGrantOrScholarshipAidByYearStrategy3();
    }
  }

  /**
   * Calculate GrantOrScholarshipAidByYear by manually calculating the pell grant aid per year and adding those values to the default IPEDS avgGrantScholarshipAid components.
   * The IPEDS avgGrantScholarshipAid components are increased by a default percent each year.
   */
  private getGrantOrScholarshipAidByYearStrategy1(): number[]
  {
    const grantOrScholarshipAidByYear: number[] = [];
    let otherAid = 0;
    const aidBreakdownInfo = this.props.institution?.avgGrantScholarshipAidBreakdownInfo;
    const startingYearDelay = this.getStartingYearDelay();

    if (!aidBreakdownInfo)
    {
      otherAid = 0;
    }
    otherAid = aidBreakdownInfo.federalGrants.otherFederalGrants.avgAmountAidReceived ?? 0
      + aidBreakdownInfo.stateLocalGovtGrantOrScholarships.avgAmountAidReceived ?? 0
      + aidBreakdownInfo.institutionalGrantsOrScholarships.avgAmountAidReceived ?? 0;

    const pellGrantAidByYear = this.getPellGrantAidByYear();

    for (let index = 0; index < this.props.yearsToCompleteDegree; index++)
    {
      const grantOrScholarshipAidForYear = pellGrantAidByYear[index]
        + (otherAid * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
      grantOrScholarshipAidByYear.push(grantOrScholarshipAidForYear);
    }

    return grantOrScholarshipAidByYear;
  }

  /**
   * Calculate GrantOrScholarshipAidByYear by using default IPEDS avgGrantScholarshipAid value for a given income range. A default percent increase is applied each year.
   */
  private getGrantOrScholarshipAidByYearStrategy2(): number[]
  {
    const grantOrScholarshipAidByYear: number[] = [];
    let avgAmountAidReceived = 0;
    const familyIncomeRange = this.props.familyIncomeRange;
    const startingYearDelay = this.getStartingYearDelay();
    switch (familyIncomeRange)
    {
      case IncomeRangeEnum.From_0_To_30000:
        avgAmountAidReceived = this.institution.avgGrantScholarshipAidByIncomeInfo.income0To30000;
        break;
      case IncomeRangeEnum.From_30001_To_48000:
        avgAmountAidReceived = this.institution.avgGrantScholarshipAidByIncomeInfo.income30001To48000;
        break;
      case IncomeRangeEnum.From_48001_To_75000:
        avgAmountAidReceived = this.institution.avgGrantScholarshipAidByIncomeInfo.income48001To75000;
        break;
      case IncomeRangeEnum.From_75001_To_110000:
        avgAmountAidReceived = this.institution.avgGrantScholarshipAidByIncomeInfo.income75001To110000;
        break;
      case IncomeRangeEnum.From_110001_Or_More:
        avgAmountAidReceived = this.institution.avgGrantScholarshipAidByIncomeInfo.incomeOver110000;
        break;
    }

    for (let index = 0; index < this.props.yearsToCompleteDegree; index++)
    {
      grantOrScholarshipAidByYear.push(avgAmountAidReceived * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
    }

    return grantOrScholarshipAidByYear;
  }

  /**
   * Calculate GrantOrScholarshipAidByYear by using default IPEDS avgGrantScholarshipAid value. A default percent increase is applied each year.
   */
  private getGrantOrScholarshipAidByYearStrategy3(): number[]
  {
    const grantOrScholarshipAidByYear: number[] = [];
    const avgAmountAidReceived = this.props.institution?.avgGrantScholarshipAidBreakdownInfo?.avgAmountAidReceived ?? 0;
    const startingYearDelay = this.getStartingYearDelay();

    for (let index = 0; index < this.props.yearsToCompleteDegree; index++)
    {
      grantOrScholarshipAidByYear.push(avgAmountAidReceived * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
    }

    return grantOrScholarshipAidByYear;
  }

  getStartingYearDelay(): number
  {
    const currentYear = new Date().getFullYear();
    const educationCostStartYear = this.startYear ?? currentYear;
    const educationCostYearsToWait = currentYear - educationCostStartYear;

    let startingYearDelay = 0;

    if (educationCostYearsToWait > startingYearDelay && educationCostYearsToWait > 0)
    {
      startingYearDelay = educationCostYearsToWait;
    }

    return startingYearDelay;
  }
  getPellGrantAidByYear(): number[]
  {
    const efc = this.props.expectedFamilyContribution;
    const costOfAttendanceByYear = this.getCostOfAttendanceByYear();
    const yearsToCompleteDegree = this.yearsToCompleteDegree;
    const pellGrantAidByYearResult = loanCalculator.getPellGrantAidByYear(efc, this.fullTimeStudentPercent, costOfAttendanceByYear, yearsToCompleteDegree);

    return pellGrantAidByYearResult;
  };
  getLoanLimitsInfo(): loanCalculator.LoanLimitsInfo
  {
    return loanCalculator.getLoanLimitsInfo(!this.props.educationFinancing.isTaxDependent, this.yearsToCompleteDegree);
  }
  getOutOfPocketExpensesByYear(): number[]
  {
    const yearsToCompleteDegree = this.yearsToCompleteDegree;
    const institution = this.institution;

    if (yearsToCompleteDegree > 0 && institution)
    {
      if (this.educationFinancing?.outOfPocketExpensesByYear?.length
        && !(this.educationFinancing.outOfPocketExpensesByYear.length === 1 && this.educationFinancing.outOfPocketExpensesByYear[0] === 0))
      {
        return this.educationFinancing.outOfPocketExpensesByYear;
      }
      else
      {
        return this.getNetPriceByYear();
      }
    }

    return [0];
  }
  getNetPriceByYear(): number[]
  {
    const netPriceByYear: number[] = [];
    const costOfAttendanceByYear = this.getCostOfAttendanceByYear();
    const grantOrScholarshipAidByYear = this.getGrantOrScholarshipAidByYear();

    for (let i = 0; i < this.yearsToCompleteDegree; i++)
    {
      netPriceByYear.push(costOfAttendanceByYear[i] - grantOrScholarshipAidByYear[i]);
    }

    return netPriceByYear;
  };

  /* #endregion */


  /* #region OUT OF POCKET OPTIMIZER */

  async shouldCalculateOptimizedOutPocketLinearPoints(): Promise<boolean>
  {
    const cumulativeCostOfAttendance = this.getCumulativeCostOfAttendance();
    const isEligibleForSubsidizedLoan = this.props.expectedFamilyContribution == null ? true : this.props.expectedFamilyContribution > cumulativeCostOfAttendance;

    const input: OptimizedOutOfPocketLinearPointsQueryVariables = {
      netPriceByYear: this.getNetPriceByYear(),
      numYears: this.yearsToCompleteDegree,
      isTaxIndependent: !this.educationFinancing.isTaxDependent,
      federalLoanYears: this.educationFinancing.yearsToPayOffFederalLoan,
      federalLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_FEDERAL_LOAN_INTEREST_RATE,
      privateLoanYears: this.educationFinancing.yearsToPayOffPrivateLoan,
      privateLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_PRIVATE_LOAN_INTEREST_RATE,
      isEligibleForSubsidizedLoan: isEligibleForSubsidizedLoan
    };

    const newHash: string = this.toHash(input);

    if (newHash !== this._optimizedOutOfPocketLinearPointsInputHash)
    {
      this._optimizedOutOfPocketLinearPointsInputHash = newHash;
      this.props.optimizedOutOfPocketLinearPointsInput = input;
      return true;
    }

    return false;
  }

  async shouldResetOptimizedOutPocketLinearPoints(): Promise<boolean>
  {
    const netPriceByYear = this.getNetPriceByYear();
    const costOfAttendanceByYear = this.getCostOfAttendanceByYear();
    if (netPriceByYear == null || this.arraySum(netPriceByYear) === 0
      || !this.yearsToCompleteDegree
      || this.educationFinancing.isTaxDependent == null
      || !this.educationFinancing.yearsToPayOffFederalLoan
      || !this.educationFinancing.yearsToPayOffPrivateLoan
      || costOfAttendanceByYear == null || this.arraySum(costOfAttendanceByYear) === 0)
    {
      return true;
    }

    return false;
  }

  updateOptimizedOutOfPocketLinearPoints(optimizedOutOfPocketLinearPoints: OptimizedOutOfPocketLinearPoints)
  {
    this.props.optimizedOutOfPocketLinearPoints = optimizedOutOfPocketLinearPoints;
  }

  /* #endregion */


  /* #region  INPUT/OUTPUT */

  calculateRoiCalculatorInput(): Promise<boolean>
  {
    const startingYearDelay: number = this.getStartingYearDelay();

    return new Promise(async (resolve, reject) =>
    {
      try
      {
        const educationFinancing: EducationFinancing = this.props.educationFinancing;
        const endDegreeLevel: number =
          this.props.degreeLevel?.value && this.props.degreeLevel.value > 0
            ? this.props.degreeLevel.value
            : 0;
        const goalStateOnetCode: string[] = this.props.occupation?.onetCode
          ? [this.props.occupation.onetCode]
          : [];
        const startDegreeLevel: number =
          this.props.userModel.educationLevel?.value &&
            this.props.userModel.educationLevel.value > 0
            ? this.props.userModel.educationLevel.value
            : 0;

        const costOfAttendanceByYear = this.getCostOfAttendanceByYear();
        const outOfPocketExpensesByYear = this.getOutOfPocketExpensesByYear();
        const grantOrScholarshipAidByYear = this.getGrantOrScholarshipAidByYear();

        const currentStateOnetCode: string[] = (this.props.userModel.occupation && this.props.userModel.occupation.onetCode) ? [this.props.userModel.occupation.onetCode] : [];

        const roiCalculatorInput: RoiCalculatorInput =
        {
          currentZipCode: this.props.userModel.location?.zipCode,
          goalZipCode: this.props.location?.zipCode ?? this.props.userModel.location?.zipCode,
          distance: this.props.radiusInMiles,
          currentStateOnetCode: currentStateOnetCode,
          currentStateOccupationTitle: this.props.userModel.occupation?.title,
          goalStateOnetCode: goalStateOnetCode,
          goalStateOccupationTitle: this.props.occupation?.title,
          startDegreeLevel: startDegreeLevel,
          endDegreeLevel: endDegreeLevel,
          yearsOfCollege: this.yearsToCompleteDegree,
          yearsToRetirement: Math.max(this.props.retirementAge - this.props.userModel.currentAge, 1),
          independent: !educationFinancing.isTaxDependent,
          ibrFederal: educationFinancing.prefersIncomeBasedRepayment,
          monthsToPayoffFederalLoan: educationFinancing.yearsToPayOffFederalLoan * 12,
          monthsToPayoffPrivateLoan: educationFinancing.yearsToPayOffPrivateLoan * 12,
          costOfAttendanceByYear: costOfAttendanceByYear,
          outOfPocketExpensesByYear: outOfPocketExpensesByYear,
          grantOrScholarshipAidByYear: grantOrScholarshipAidByYear,
          federalSubsidizedLoanAmountByYear: educationFinancing.federalSubsidizedLoanAmountByYear,
          federalUnsubsidizedLoanAmountByYear: educationFinancing.federalUnsubsidizedLoanAmountByYear,
          privateLoanAmountByYear: educationFinancing.privateLoanAmountByYear,
          federalLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_FEDERAL_LOAN_INTEREST_RATE,
          privateLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_PRIVATE_LOAN_INTEREST_RATE,
          isFulltime: this.props.isFulltime,
          workDuringStudy: false,
          ipedsGraduationTimeFactor: [1.0, 1.5, 2.0],
          ipedsGraduationProbability: [1.0, 1.0, 1.0],
          ipedsRetentionRate: [1.0, 1.0, 1.0],
          startingYearDelay: startingYearDelay,
          noLoans: false
        };

        const newHash: string = this.toHash(roiCalculatorInput);

        if (newHash !== this._roiCalculatorInputHash)
        {
          this._roiCalculatorInputHash = newHash;
          this._roiCalculatorInput = roiCalculatorInput;
          resolve(true);
        }

        resolve(false);
      }
      catch (error)
      {
        reject(error);
      }
    });
  }

  updateRoiCalculatorOutput(roiCalculatorOutput: RoiCalculatorOutputModel): void
  {
    this._roiCalculatorOutput = roiCalculatorOutput;
  }

  /* #endregion */


  businessRules_Run_All(): void
  {
    this.businessRules_Update_DegreeLevel();
    this.businessRules_Update_YearsToCompleteDegree();
    this.businessRules_Update_Default_Name_To_Institution_Name();
    this.businessRules_Update_Out_Of_Pocket_Expense();
  }

  businessRules_Update_LocationDefault(): void
  {
    if (this.props.location == null && this.props.userModel.location != null)
    {
      this.props.location = this.props.userModel.location;
    }
  }

  businessRules_Update_OccupationDefault(): void
  {
    if (this.props.occupation == null && this.props.userModel.occupation != null)
    {
      this.props.occupation = this.props.userModel.occupation;
    }
  }

  businessRules_Update_DegreeLevel(): void
  {
    if (this.props.occupation && this.props.occupation.typicalEducationLevelGroupId)
    {
      const defaultEducationLevelEnum: EducationLevelEnum = EducationLevelEnum.getEducationLevelByGroupId(this.props.occupation.typicalEducationLevelGroupId);

      this.props.degreeLevel = defaultEducationLevelEnum;
      // console.log('OVERRIDE EDUCATION LEVEL', defaultEducationLevelEnum);
    }
  }

  // SEED NUMBER OF YEARS TO COMPLETE DEGREE BASED ON DESIRED EDUCATION LEVEL
  businessRules_Update_YearsToCompleteDegree(): void
  {
    // TODO: This continually sets the years to complete degree, not allowing the user to change the years to complete
    // console.log('🚀 ~ file: model.ts ~ this.props.degreeLevel', this.props.degreeLevel);
    // let yearsToCompleteDegree: number;

    // const yearsOfCollegeFunc: Map<number, Function> = new Map();
    // yearsOfCollegeFunc.set(EducationLevelEnum.NinthGradeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.TenthGradeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.EleventhGradeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.TwelfthDegreeStudent.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.HighSchoolGraduate.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_HIGH_SCHOOL);
    // yearsOfCollegeFunc.set(EducationLevelEnum.AssociatesDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_ASSOCIATES_DEGREE);
    // yearsOfCollegeFunc.set(EducationLevelEnum.BachelorsDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_BACHELORS_DEGREE);
    // yearsOfCollegeFunc.set(EducationLevelEnum.MastersDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_MASTERS_DEGREE);
    // yearsOfCollegeFunc.set(EducationLevelEnum.DoctorateDegree.value, () => CONFIG.EDUCATION_COST.YEARS_OF_COLLEGE_DOCTORATE_DEGREE);


    // console.log('🚀 ~ file: model.ts ~ yearsOfCollegeFunc', yearsOfCollegeFunc);
    // console.log('🚀 ~ file: model.ts ~ yearsOfCollegeFunc.get(this.props.degreeLevel)', yearsOfCollegeFunc.get(this.props.degreeLevel.value));
    // if (this.props.degreeLevel)
    // {
    //   yearsToCompleteDegree = (yearsOfCollegeFunc.get(this.props.degreeLevel.value) || yearsOfCollegeFunc.get(EducationLevelEnum.HighSchoolGraduate.value))();
    // }
    // else
    // {
    //   yearsToCompleteDegree = (yearsOfCollegeFunc.get(EducationLevelEnum.HighSchoolGraduate.value))();
    // }

    // console.log('🚀 ~ file: model.ts ~ this.props.yearsToCompleteDegree', this.props.yearsToCompleteDegree);
    // console.log('🚀 ~ file: model.ts ~ line 774 ~ yearsToCompleteDegree', yearsToCompleteDegree);
    // this.props.yearsToCompleteDegree = yearsToCompleteDegree;
  }

  businessRules_Update_Default_Name_To_Institution_Name(): void
  {
    if (this.props.name.startsWith(Model.defaultProps.name) && this.props.institution)
    {
      this.props.name = this.props.institution.name;
    }
  }

  // CALCULATE DEFAULT OUT OF POCKET AMOUNT BASED ON INSTITUTION AND NUMBER OF YEARS TO COMPLETE DEGREE
  businessRules_Update_Out_Of_Pocket_Expense(): void
  {
    const outOfPocketExpensesByYear: number[] = this.getOutOfPocketExpensesByYear();

    this.educationFinancing.updateOutOfPocketExpensesByYear(outOfPocketExpensesByYear);
  }


  private toHash(input: RoiCalculatorInput | OptimizedOutOfPocketLinearPointsQueryVariables): string
  {
    return hash(input);
  }

  private arraySum(numberArray: number[]): number
  {
    return numberArray.reduce((p, c) => p + c, 0);
  };
}
