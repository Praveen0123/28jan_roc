import { CONFIG } from '../../config/config';
import { IncomeRangeEnum, LivingConditionTypeEnum, ResidencyTypeEnum, RocCalculatorInput } from '../../models';
import { CostLineItem, CostOfAttendanceBreakdownModel, CostOfAttendanceSummary, LivingArrangementModel, LoanLimitsModel, TuitionAndFeesModel } from '../../models/interfaces';
import { EducationFinancingModel } from '../education-financing-model';
import { RocModel } from '../roc-model';
import { UserModel } from '../user-model';


export class RocModelService
{

  static getCostOfAttendanceByYear(rocModel: RocModel, usePercentChangeFromLastYear: boolean = false): number[]
  {
    const costOfAttendanceSummary: CostOfAttendanceSummary = this.calculateCostOfAttendanceSummary(rocModel);
    const yearsToCompleteDegree: number = rocModel.yearsToCompleteDegree;
    const startingYearDelay = this.getStartingYearDelay(rocModel);
    const costOfAttendanceByYear = [];

    if (usePercentChangeFromLastYear)
    {
      for (let yearIndex = 0; yearIndex < yearsToCompleteDegree; yearIndex++)
      {
        costOfAttendanceByYear.push(this.getCostOfAttendanceForYear(costOfAttendanceSummary, yearIndex, startingYearDelay));
      }
    }
    else
    {
      for (let index = 0; index < yearsToCompleteDegree; index++)
      {
        costOfAttendanceByYear.push(costOfAttendanceSummary.totalExpense * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
      }
    }

    return costOfAttendanceByYear;
  }
  static getCumulativeCostOfAttendance(rocModel: RocModel): number
  {
    return this.getCostOfAttendanceByYear(rocModel).reduce((p, c) => p + c, 0);
  }
  static getTotalLoanAmount(rocModel: RocModel): number
  {
    const totalFederalLoans = (rocModel.educationFinancingModel?.federalLoanAmountByYear ?? []).reduce((p, c) => p + c, 0);
    const totalPrivateLoans = (rocModel.educationFinancingModel?.privateLoanAmountByYear ?? []).reduce((p, c) => p + c, 0);
    return totalFederalLoans + totalPrivateLoans;
  }
  static getGrantsByYear(rocModel: RocModel, userModel: UserModel): number[]
  {
    if (userModel.expectedFamilyContribution !== null)
    {
      return this.getGrantsByYearStrategy1(rocModel, userModel);
    }
    else if (userModel.incomeRange !== null && userModel.incomeRange.key !== IncomeRangeEnum.UNKNOWN.key)
    {
      return this.getGrantsByYearStrategy2(rocModel, userModel);
    }
    else
    {
      return this.getGrantsByYearStrategy3(rocModel);
    }
  }
  static getStartingYearDelay(rocModel: RocModel): number
  {
    const currentYear = new Date().getFullYear();
    const educationCostStartYear = rocModel.startYear ?? currentYear;
    const educationCostYearsToWait = currentYear - educationCostStartYear;

    let startingYearDelay = 0;

    if (educationCostYearsToWait > startingYearDelay && educationCostYearsToWait > 0)
    {
      startingYearDelay = educationCostYearsToWait;
    }

    return startingYearDelay;
  }


  // TODO: check max pell amount. I found one source that says it's 6345 for fulltime and 1698 for halftime
  static getPellGrantAidByYear(rocModel: RocModel, userModel: UserModel): number[]
  {
    const efc = userModel.expectedFamilyContribution;
    const costOfAttendanceByYear = this.getCostOfAttendanceByYear(rocModel);
    const yearsToCompleteDegree = rocModel.yearsToCompleteDegree;
    const pellGrantAidByYear = [];

    for (let i = 0; i < yearsToCompleteDegree; i++)
    {
      pellGrantAidByYear.push(this.getPellGrantAidForYear(efc, costOfAttendanceByYear[i], rocModel.fullTimeStudentPercent));
    }

    return pellGrantAidByYear;
  };


  static getLoanLimitsInfo(rocModel: RocModel): LoanLimitsModel
  {
    const isTaxIndependent: boolean = !rocModel.educationFinancingModel.isTaxDependent;
    const yearsToCompleteDegree: number = rocModel.yearsToCompleteDegree;
    const federalSubsidizedLoanByYear = [];
    const federalUnsubsidizedLoanByYear = [];

    for (let i = 0; i < yearsToCompleteDegree; i++)
    {
      const r = this.getLoanLimitsForYear(isTaxIndependent, i);
      federalSubsidizedLoanByYear.push(r.yearSubsidized);
      federalUnsubsidizedLoanByYear.push(r.yearUnsubsidized);
    }

    const loanLimitsModel: LoanLimitsModel =
    {
      federalSubsidizedLoanByYear,
      federalUnsubsidizedLoanByYear,
      cumulativeFederalSubsidizedLoan: (isTaxIndependent)
        ? CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_SUBSIDIZED.TOTAL
        : CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_SUBSIDIZED.TOTAL,
      cumulativeFederalUnsubsidizedLoan: (isTaxIndependent)
        ? CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_UNSUBSIDIZED.TOTAL
        : CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_UNSUBSIDIZED.TOTAL,
    };

    return loanLimitsModel;
  }
  static getOutOfPocketExpensesByYear(rocModel: RocModel, userModel: UserModel): number[]
  {
    const yearsToCompleteDegree = rocModel.yearsToCompleteDegree;
    const institutionModel = rocModel.institutionModel;

    if (yearsToCompleteDegree > 0 && institutionModel)
    {
      if (rocModel.educationFinancingModel?.outOfPocketExpensesByYear?.length
        && !(rocModel.educationFinancingModel.outOfPocketExpensesByYear.length === 1 && rocModel.educationFinancingModel.outOfPocketExpensesByYear[0] === 0))
      {
        return rocModel.educationFinancingModel.outOfPocketExpensesByYear;
      }
      else
      {
        return this.getNetPriceByYear(rocModel, userModel);
      }
    }

    return [0];
  }
  static getNetPriceByYear(rocModel: RocModel, userModel: UserModel): number[]
  {
    const netPriceByYear: number[] = [];
    const costOfAttendanceByYear = this.getCostOfAttendanceByYear(rocModel);
    const grantsByYear = this.getGrantsByYear(rocModel, userModel);

    for (let i = 0; i < rocModel.yearsToCompleteDegree; i++)
    {
      netPriceByYear.push(costOfAttendanceByYear[i] - grantsByYear[i]);
    }

    return netPriceByYear;
  };


  static generateRocCalculatorInput(rocModel: RocModel, userModel: UserModel): Promise<RocCalculatorInput>
  {
    return new Promise(async (resolve, reject) =>
    {
      try
      {
        const startingYearDelay: number = this.getStartingYearDelay(rocModel);
        const educationFinancing: EducationFinancingModel = rocModel.educationFinancingModel;
        const endDegreeLevel: number =
          rocModel.degreeLevel?.value && rocModel.degreeLevel.value > 0
            ? rocModel.degreeLevel.value
            : 0;
        const goalStateOnetCode: string[] = rocModel.occupationModel?.onetCode
          ? [rocModel.occupationModel.onetCode]
          : [];
        const startDegreeLevel: number =
          userModel.educationLevel?.value &&
            userModel.educationLevel.value > 0
            ? userModel.educationLevel.value
            : 0;

        const costOfAttendanceByYear = this.getCostOfAttendanceByYear(rocModel);
        const outOfPocketExpensesByYear = this.getOutOfPocketExpensesByYear(rocModel, userModel);
        const grantsByYear = this.getGrantsByYear(rocModel, userModel);

        const currentStateOnetCode: string[] = (userModel.occupationModel && userModel.occupationModel.onetCode) ? [userModel.occupationModel.onetCode] : [];

        const rocCalculatorInput: RocCalculatorInput =
        {
          currentZipCode: userModel.locationModel?.zipCode,
          goalZipCode: rocModel.locationModel?.zipCode ?? userModel.locationModel?.zipCode,
          distance: rocModel.radiusInMiles,
          currentStateOnetCode: currentStateOnetCode,
          currentStateOccupationTitle: userModel.occupationModel?.title,
          goalStateOnetCode: goalStateOnetCode,
          goalStateOccupationTitle: rocModel.occupationModel?.title,
          startDegreeLevel: startDegreeLevel,
          endDegreeLevel: endDegreeLevel,
          yearsOfCollege: rocModel.yearsToCompleteDegree,
          yearsToRetirement: Math.max(rocModel.retirementAge - userModel.currentAge, 1),
          independent: !educationFinancing.isTaxDependent,
          ibrFederal: educationFinancing.prefersIncomeBasedRepayment,
          monthsToPayoffFederalLoan: educationFinancing.yearsToPayOffFederalLoan * 12,
          monthsToPayoffPrivateLoan: educationFinancing.yearsToPayOffPrivateLoan * 12,
          costOfAttendanceByYear: costOfAttendanceByYear,
          outOfPocketExpensesByYear: outOfPocketExpensesByYear,
          grantOrScholarshipAidByYear: grantsByYear,
          federalSubsidizedLoanAmountByYear: educationFinancing.federalSubsidizedLoanAmountByYear,
          federalUnsubsidizedLoanAmountByYear: educationFinancing.federalUnsubsidizedLoanAmountByYear,
          privateLoanAmountByYear: educationFinancing.privateLoanAmountByYear,
          federalLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_FEDERAL_LOAN_INTEREST_RATE,
          privateLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_PRIVATE_LOAN_INTEREST_RATE,
          isFulltime: rocModel.isFulltime,
          workDuringStudy: false,
          ipedsGraduationTimeFactor: [1.0, 1.5, 2.0],
          ipedsGraduationProbability: [1.0, 1.0, 1.0],
          ipedsRetentionRate: [1.0, 1.0, 1.0],
          startingYearDelay: startingYearDelay,
          noLoans: false
        };

        resolve(rocCalculatorInput);
      }
      catch (error)
      {
        reject(error);
      }
    });
  }







  /**
   * Calculate grantsByYear by manually calculating the pell grant aid per year and adding those values to the default IPEDS avgGrantScholarshipAid components.
   * The IPEDS avgGrantScholarshipAid components are increased by a default percent each year.
   */
  private static getGrantsByYearStrategy1(rocModel: RocModel, userModel: UserModel): number[]
  {
    const grantsByYear: number[] = [];
    let otherAid = 0;
    const aidBreakdownInfo = rocModel.institutionModel?.avgGrantScholarshipAidBreakdownModel;
    const startingYearDelay = this.getStartingYearDelay(rocModel);

    if (!aidBreakdownInfo)
    {
      otherAid = 0;
    }
    otherAid = aidBreakdownInfo.federalGrants.otherFederalGrants.avgAmountAidReceived ?? 0
      + aidBreakdownInfo.stateLocalGovtGrantOrScholarships.avgAmountAidReceived ?? 0
      + aidBreakdownInfo.institutionalGrantsOrScholarships.avgAmountAidReceived ?? 0;

    const pellGrantAidByYear = this.getPellGrantAidByYear(rocModel, userModel);

    for (let index = 0; index < rocModel.yearsToCompleteDegree; index++)
    {
      const grantOrScholarshipAidForYear = pellGrantAidByYear[index]
        + (otherAid * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
      grantsByYear.push(grantOrScholarshipAidForYear);
    }

    return grantsByYear;
  }

  /**
   * Calculate grantsByYear by using default IPEDS avgGrantScholarshipAid value for a given income range. A default percent increase is applied each year.
   */
  private static getGrantsByYearStrategy2(rocModel: RocModel, userModel: UserModel): number[]
  {
    const grantsByYear: number[] = [];
    let avgAmountAidReceived = 0;

    const startingYearDelay = this.getStartingYearDelay(rocModel);

    switch (userModel.incomeRange)
    {
      case IncomeRangeEnum.From_0_To_30000:
        avgAmountAidReceived = rocModel.institutionModel.avgGrantScholarshipAidByIncomeModel.income0To30000;
        break;
      case IncomeRangeEnum.From_30001_To_48000:
        avgAmountAidReceived = rocModel.institutionModel.avgGrantScholarshipAidByIncomeModel.income30001To48000;
        break;
      case IncomeRangeEnum.From_48001_To_75000:
        avgAmountAidReceived = rocModel.institutionModel.avgGrantScholarshipAidByIncomeModel.income48001To75000;
        break;
      case IncomeRangeEnum.From_75001_To_110000:
        avgAmountAidReceived = rocModel.institutionModel.avgGrantScholarshipAidByIncomeModel.income75001To110000;
        break;
      case IncomeRangeEnum.From_110001_Or_More:
        avgAmountAidReceived = rocModel.institutionModel.avgGrantScholarshipAidByIncomeModel.incomeOver110000;
        break;
    }

    for (let index = 0; index < rocModel.yearsToCompleteDegree; index++)
    {
      grantsByYear.push(avgAmountAidReceived * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
    }

    return grantsByYear;
  }

  /**
   * Calculate grantsByYear by using default IPEDS avgGrantScholarshipAid value. A default percent increase is applied each year.
   */
  private static getGrantsByYearStrategy3(rocModel: RocModel): number[]
  {
    const grantsByYear: number[] = [];
    const avgAmountAidReceived = rocModel.institutionModel?.avgGrantScholarshipAidBreakdownModel?.avgAmountAidReceived ?? 0;
    const startingYearDelay = this.getStartingYearDelay(rocModel);

    for (let index = 0; index < rocModel.yearsToCompleteDegree; index++)
    {
      grantsByYear.push(avgAmountAidReceived * Math.pow(1 + CONFIG.EDUCATION_COST.DEFAULT_COST_OF_LIVING_ADJUSTMENT, index + startingYearDelay));
    }

    return grantsByYear;
  }



  private static getLoanLimitsForYear = (isTaxIndependent: boolean, yearOfCollegeIndex: number) =>
  {
    let yearSubsidized;
    let yearUnsubsidized;

    if (isTaxIndependent)
    {
      if (yearOfCollegeIndex === 0)
      {
        yearSubsidized = CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_SUBSIDIZED.YEAR_1;
        yearUnsubsidized = CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_UNSUBSIDIZED.YEAR_1;
      }
      else if (yearOfCollegeIndex === 1)
      {
        yearSubsidized = CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_SUBSIDIZED.YEAR_2;
        yearUnsubsidized = CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_UNSUBSIDIZED.YEAR_2;
      }
      else
      {
        yearSubsidized =
          CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_SUBSIDIZED.YEAR_3_PLUS;
        yearUnsubsidized =
          CONFIG.LOAN_CONSTANTS.INDEPENDENT.FEDERAL_UNSUBSIDIZED.YEAR_3_PLUS;
      }
    }
    else
    {
      if (yearOfCollegeIndex === 0)
      {
        yearSubsidized = CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_SUBSIDIZED.YEAR_1;
        yearUnsubsidized = CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_UNSUBSIDIZED.YEAR_1;
      }
      else if (yearOfCollegeIndex === 1)
      {
        yearSubsidized = CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_SUBSIDIZED.YEAR_2;
        yearUnsubsidized = CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_UNSUBSIDIZED.YEAR_2;
      }
      else
      {
        yearSubsidized = CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_SUBSIDIZED.YEAR_3_PLUS;
        yearUnsubsidized =
          CONFIG.LOAN_CONSTANTS.DEPENDENT.FEDERAL_UNSUBSIDIZED.YEAR_3_PLUS;
      }
    }

    const result = {
      yearSubsidized,
      yearUnsubsidized,
    };

    return result;
  };

  private static getPellGrantAidForYear = (efc: number, costOfAttendance: number, fullTimeStudentPercent: number) =>
  {
    if (efc === null)
    {
      efc = 1e20;
    }

    let maxLimit;
    if (fullTimeStudentPercent === 1)
    {
      maxLimit = 5711;
    }
    else
    {
      maxLimit = 5100;
    }

    let pellGrantAid = (costOfAttendance - efc) * fullTimeStudentPercent;

    if (pellGrantAid < 638)
    {
      pellGrantAid = 0;
    }
    else if (pellGrantAid > maxLimit)
    {
      pellGrantAid = maxLimit;
    };

    return pellGrantAid;
  };



  private static calculateCostOfAttendanceSummary(rocModel: RocModel): CostOfAttendanceSummary
  {
    const tuitionAndFees: CostLineItem = this.calculateTuitionAndFees(rocModel);
    const booksAndSupplies: CostLineItem = this.calculateBooksAndSupplies(rocModel);
    const roomAndBoard: CostLineItem = this.calculateRoomAndBoard(rocModel);
    const otherLivingExpenses: CostLineItem = this.calculateOtherLivingExpenses(rocModel);
    const totalExpense: number = tuitionAndFees.expenseAmount + booksAndSupplies.expenseAmount + roomAndBoard.expenseAmount + otherLivingExpenses.expenseAmount;

    const costOfAttendanceSummary: CostOfAttendanceSummary =
    {
      tuitionAndFees: this.calculateTuitionAndFees(rocModel),
      booksAndSupplies: this.calculateBooksAndSupplies(rocModel),
      roomAndBoard: this.calculateRoomAndBoard(rocModel),
      otherLivingExpenses: this.calculateOtherLivingExpenses(rocModel),
      totalExpense: totalExpense
    };

    return costOfAttendanceSummary;
  }
  private static calculateTuitionAndFees(rocModel: RocModel): CostLineItem
  {
    // default to in-state if residencyType null or UNKNOWN
    const tuitionAndFeesModel: TuitionAndFeesModel = rocModel?.institutionModel?.costOfAttendanceModel.tuitionAndFees;
    const residencyType = rocModel?.residencyType ?? ResidencyTypeEnum.IN_STATE;

    let tuitionAndFees = 0;
    let tuitionAndFeesRaise = 0;

    if (tuitionAndFeesModel)
    {
      switch (residencyType)
      {
        case ResidencyTypeEnum.UNKNOWN:
        case ResidencyTypeEnum.IN_STATE:
          tuitionAndFees = tuitionAndFeesModel.inState.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesModel.inState.percentChangeFromLastYear;
          break;
        case ResidencyTypeEnum.IN_DISTRICT:
          tuitionAndFees = tuitionAndFeesModel.inDistrict.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesModel.inDistrict.percentChangeFromLastYear;
          break;
        case ResidencyTypeEnum.OUT_STATE:
          tuitionAndFees = tuitionAndFeesModel.outOfState.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesModel.outOfState.percentChangeFromLastYear;
          break;
        default:
          tuitionAndFees = tuitionAndFeesModel.inState.expenseAmount;
          tuitionAndFeesRaise = tuitionAndFeesModel.inState.percentChangeFromLastYear;
          break;
      }

      // if falsey values, fall ball to other residency values
      if (!tuitionAndFees)
      {
        tuitionAndFees = tuitionAndFeesModel.inDistrict.expenseAmount
          ?? tuitionAndFeesModel.inState.expenseAmount
          ?? tuitionAndFeesModel.outOfState.expenseAmount
          ?? 0;
      }
      if (!tuitionAndFeesRaise)
      {
        tuitionAndFeesRaise = tuitionAndFeesModel.inDistrict.percentChangeFromLastYear
          ?? tuitionAndFeesModel.inState.percentChangeFromLastYear
          ?? tuitionAndFeesModel.outOfState.percentChangeFromLastYear
          ?? 0;
      }
    }

    const costLineItem: CostLineItem =
    {
      expenseAmount: tuitionAndFees,
      percentChangeFromLastYear: tuitionAndFeesRaise / 100
    };

    return costLineItem;
  }
  private static calculateBooksAndSupplies(rocModel: RocModel): CostLineItem
  {
    const costOfAttendanceBreakdownModel: CostOfAttendanceBreakdownModel = rocModel?.institutionModel?.costOfAttendanceModel.booksAndSupplies;

    const costLineItem: CostLineItem =
    {
      expenseAmount: costOfAttendanceBreakdownModel?.expenseAmount ?? 0,
      percentChangeFromLastYear: (costOfAttendanceBreakdownModel?.percentChangeFromLastYear ?? 0) / 100
    };

    return costLineItem;
  }
  private static calculateRoomAndBoard(rocModel: RocModel): CostLineItem
  {
    // default to on campus if livingConditionType null or UNKNOWN
    const livingArrangementCostInfo: LivingArrangementModel = rocModel?.institutionModel?.costOfAttendanceModel.livingArrangement;
    const livingConditionType: LivingConditionTypeEnum = rocModel?.livingConditionTypeEnum ?? LivingConditionTypeEnum.ON_CAMPUS;

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

    const costLineItem: CostLineItem =
    {
      expenseAmount: roomAndBoardCost,
      percentChangeFromLastYear: roomAndBoardCostRaise / 100
    };

    return costLineItem;
  }
  private static calculateOtherLivingExpenses(rocModel: RocModel): CostLineItem
  {
    // default to on campus if livingConditionType null or UNKNOWN
    const livingArrangementCostInfo: LivingArrangementModel = rocModel?.institutionModel?.costOfAttendanceModel.livingArrangement;
    const livingConditionType: LivingConditionTypeEnum = rocModel?.livingConditionTypeEnum ?? LivingConditionTypeEnum.ON_CAMPUS;

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

    const costLineItem: CostLineItem =
    {
      expenseAmount: otherLivingExpenses,
      percentChangeFromLastYear: otherLivingExpensesRaise / 100
    };

    return costLineItem;
  }
  private static getCostOfAttendanceForYear(costOfAttendanceSummary: CostOfAttendanceSummary, yearOfCollegeIndex: number, startingYearDelay: number = 0): number
  {

    const tuitionAndFees: number = (costOfAttendanceSummary.tuitionAndFees.expenseAmount * Math.pow(1.0 + (costOfAttendanceSummary.tuitionAndFees.percentChangeFromLastYear / 100), yearOfCollegeIndex + startingYearDelay));

    // const booksAndSupplies: number = (costOfAttendanceSummary.booksAndSupplies.expenseAmount * Math.pow(1.0 + (costOfAttendanceSummary.booksAndSupplies.percentChangeFromLastYear / 100), yearOfCollegeIndex + startingYearDelay));
    const booksAndSupplies: number = 0;

    const roomAndBoard: number = (costOfAttendanceSummary.roomAndBoard.expenseAmount * Math.pow(1.0 + (costOfAttendanceSummary.roomAndBoard.percentChangeFromLastYear / 100), yearOfCollegeIndex + startingYearDelay));

    // const otherLivingExpenses: number = (costOfAttendanceSummary.otherLivingExpenses.expenseAmount * Math.pow(1.0 + (costOfAttendanceSummary.otherLivingExpenses.percentChangeFromLastYear / 100), yearOfCollegeIndex + startingYearDelay));
    const otherLivingExpenses: number = 0;


    return tuitionAndFees + booksAndSupplies + roomAndBoard + otherLivingExpenses;
  };

}
