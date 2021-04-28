import { OptimizedOutOfPocketLinearPoints, OptimizedOutOfPocketLinearPointsQueryVariables } from '@gql';
import { AggregateRoot, Guard, Result, UniqueEntityID } from '@vantage-point/ddd-core';

import { CareerGoalDto, CurrentInformationDto, DialogDataToKeepModel, EducationCostDto, EducationFinancingDto } from '../dtos';
import { RoiModelMissingError } from '../errors';
import { RoiCalculatorInput, RoiCalculatorOutputModel } from '../models';
import { EducationFinancing, EducationFinancingProps } from './education-financing.model';
import { Model, ModelProps } from './model';
import { RoiAggregateId } from './roi-aggregate-id';
import { RoiModelId } from './roi-model-id';
import { UserModel } from './user-model';


interface RoiAggregateProps
{
  name: string;
  userModel: UserModel;
  model?: Model;
  dateCreated?: Date;
  lastUpdated?: Date;
}


export class RoiAggregate extends AggregateRoot<RoiAggregateProps>
{
  private _roiAggregateId: RoiAggregateId;
  private _activeModelId: RoiModelId;
  private store: Map<string, Model> = new Map();


  /* #region  PROPS */

  get roiAggregateId(): string
  {
    return this._roiAggregateId.id.toString();
  }
  get name(): string
  {
    return this.props.name;
  }
  get userModel(): UserModel
  {
    return this.props.userModel;
  }
  get activeModel(): Model
  {
    const key: string = this._activeModelId.id.toString();

    if (this.store.has(key))
    {
      return this.store.get(key);
    }

    throw RoiModelMissingError.create('ROI AGGREGATE IS MISSING MODEL');
  }
  get roiCalculatorInput(): RoiCalculatorInput
  {
    return this.activeModel.roiCalculatorInput;
  }
  get optimizedOutOfPocketLinearPointsInput(): OptimizedOutOfPocketLinearPointsQueryVariables
  {
    return this.activeModel.optimizedOutOfPocketLinearPointsInput;
  }
  get modelList(): Model[]
  {
    return Array.from(this.store.values());
  }
  get modelCount(): number
  {
    return (this.store) ? this.store.size : 0;
  }
  get dateCreated(): Date
  {
    return this.props.dateCreated;
  }
  get lastUpdated(): Date
  {
    return this.props.lastUpdated;
  }

  /* #endregion */


  private constructor(props: RoiAggregateProps, id?: UniqueEntityID)
  {
    super(props, id);

    this._roiAggregateId = RoiAggregateId.create(this._id);

    this.updateInternalStore(props.model, 0);
  }

  static create(props: RoiAggregateProps, id?: UniqueEntityID): Result<RoiAggregate>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<RoiAggregate>(propsResult.message || 'roi aggregate properties error');
    }

    const roiAggregate = new RoiAggregate
      (
        {
          ...props
        },
        id
      );

    return Result.success<RoiAggregate>(roiAggregate);
  }

  static get defaultProps(): RoiAggregateProps
  {
    const defaultName: string = 'ROI Collection';
    const userModelOrError: Result<UserModel> = UserModel.create(UserModel.defaultProps);

    if (userModelOrError.isSuccess)
    {
      const userModel: UserModel = userModelOrError.getValue();
      const modelOrError: Result<Model> = Model.create(Model.defaultProps, userModel);

      if (modelOrError.isSuccess)
      {
        const props: RoiAggregateProps =
        {
          name: defaultName,
          userModel: userModel,
          model: modelOrError.getValue(),
          dateCreated: new Date(),
          lastUpdated: new Date()
        };

        return props;
      }
    }

    return {
      name: defaultName,
      userModel: null,
      model: null,
      dateCreated: new Date(),
      lastUpdated: new Date()
    };
  }



  /* #region  CREATING/DELETING ACIVITIES */

  createEmptyRoiModel(name?: string): void
  {
    const modelOrError: Result<Model> = Model.create
      (
        {
          ...Model.defaultProps,
          name: name ?? this.getDefaultModelName()
        },
        this.props.userModel
      );

    if (modelOrError.isSuccess)
    {
      this.updateInternalStore(modelOrError.getValue(), 1);
    }
    else
    {
      throw modelOrError.getError();
    }
  }
  clone(dialogDataToKeepModel: DialogDataToKeepModel): void
  {
    const defaultProps: ModelProps = Model.defaultProps;

    const cloneOrError: Result<Model> = Model.create
      (
        {
          userModel: defaultProps.userModel,
          name: dialogDataToKeepModel.modelName,

          location: (dialogDataToKeepModel.isGoalLocationCloned) ? this.activeModel.location : defaultProps.location,
          occupation: (dialogDataToKeepModel.isGoalOccupationCloned) ? this.activeModel.occupation : defaultProps.occupation,
          degreeLevel: (dialogDataToKeepModel.isGoalDegreeLevelCloned) ? this.activeModel.degreeLevel : defaultProps.degreeLevel,
          degreeProgram: (dialogDataToKeepModel.isGoalDegreeProgramCloned) ? this.activeModel.degreeProgram : defaultProps.degreeProgram,
          retirementAge: (dialogDataToKeepModel.isGoalRetirementAgeCloned) ? this.activeModel.retirementAge : defaultProps.retirementAge,
          careerGoalPathType: this.activeModel.careerGoalPathType,

          institution: (dialogDataToKeepModel.isEducationCostInstitutionCloned) ? this.activeModel.institution : defaultProps.institution,
          startYear: (dialogDataToKeepModel.isEducationCostStartSchoolCloned) ? this.activeModel.startYear : defaultProps.startYear,
          familyIncomeRange: (dialogDataToKeepModel.isEducationCostStartSchoolCloned) ? this.activeModel.familyIncomeRange : defaultProps.familyIncomeRange,
          isFulltime: (dialogDataToKeepModel.isEducationCostPartTimeFullTimeCloned) ? this.activeModel.isFulltime : defaultProps.isFulltime,
          yearsToCompleteDegree: (dialogDataToKeepModel.isEducationCostYearsToCompleteCloned) ? this.activeModel.yearsToCompleteDegree : defaultProps.yearsToCompleteDegree,

          residencyType: this.activeModel.residencyType,
          livingConditionTypeEnum: this.activeModel.livingConditionTypeEnum,
          costOfAttendance: this.activeModel.costOfAttendance,
          grantsAndScholarships: this.activeModel.grantsAndScholarships,
          expectedFamilyContribution: this.activeModel.expectedFamilyContribution,

          optimizedOutOfPocketLinearPointsInput: this.activeModel.optimizedOutOfPocketLinearPointsInput,
          optimizedOutOfPocketLinearPoints: this.activeModel.optimizedOutOfPocketLinearPoints,
          educationFinancing: this.activeModel.educationFinancing,

          radiusInMiles: this.activeModel.radiusInMiles
        },
        this.props.userModel,
        null
      );

    if (cloneOrError.isSuccess)
    {
      this.updateInternalStore(cloneOrError.getValue(), 2);
    }
  }
  makeActive(key: string): void
  {
    if (this.store.has(key))
    {
      this.setAcitiveModelFromId(RoiModelId.create(key));
    }
    else
    {
      const message: string = `ROI Aggregate Model (${key}) does not exist`;
      throw RoiModelMissingError.create(message);
    }
  }
  deleteRoiModel(roiModelId: RoiModelId): void
  {
    const key: string = roiModelId.id.toString();
    const activeKey: string = this._activeModelId.id.toString();

    if (this.store.has(key))
    {
      this.store.delete(key);

      // IF STORE IS EMPTY, CREATE A NEW ROI MODEL
      if (this.store.size === 0)
      {
        this.createEmptyRoiModel();
      }

      // IF MODEL BEING DELETED IS ACTIVE MODEL, THEN FIND NEW ACTIVE
      else if (key === activeKey)
      {
        const nextModel: Model = this.modelList[0];

        this.setAcitiveModelFromId(nextModel.roiModelId);
      }

      this.props.lastUpdated = new Date();
    }
  }
  loadModelList(list: Model[]): void
  {
    list.map((item: Model) =>
    {
      const key: string = item.roiModelId.id.toString();
      this.store.set(key, item);
    });
  }

  /* #endregion */



  /* #region UPDATE AGGREGATE FROM DATA ENTRY FORMS */

  updateRoiAggregateName(name: string)
  {
    this.props.name = name;
    this.props.lastUpdated = new Date();
  }
  updateRoiModelName(name: string)
  {
    this.activeModel.updateModelName(name);
    this.props.lastUpdated = new Date();
  }
  updateCurrentInformation(currentInformationDto: CurrentInformationDto): void
  {
    const updatedUserOrError: Result<UserModel> = UserModel.create
      (
        {
          currentAge: (currentInformationDto.currentAge) ? currentInformationDto.currentAge : this.userModel.currentAge,
          occupation: currentInformationDto.occupation,
          location: currentInformationDto.location,
          educationLevel: currentInformationDto.educationLevel,
          incomeRange: this.userModel.incomeRange
        }
      );

    if (updatedUserOrError.isSuccess)
    {
      this.props.userModel = updatedUserOrError.getValue();

      this.activeModel.updateModelUser(this.props.userModel);
      this.activeModel.businessRules_Update_LocationDefault();
      this.activeModel.businessRules_Update_OccupationDefault();

      this.props.lastUpdated = new Date();
    }
    else
    {
      throw updatedUserOrError.getError();
    }
  }
  updateCareerGoal(careerGoalDto: CareerGoalDto): void
  {
    const updatedCareerGoalOrError: Result<Model> = Model.create
      (
        {
          userModel: null,
          name: this.activeModel.name,

          location: careerGoalDto.location,
          occupation: careerGoalDto.occupation,
          degreeLevel: careerGoalDto.degreeLevel,
          degreeProgram: careerGoalDto.degreeProgram,
          retirementAge: careerGoalDto.retirementAge,
          careerGoalPathType: (careerGoalDto.careerGoalPathType) ? careerGoalDto.careerGoalPathType : this.activeModel.careerGoalPathType,

          institution: this.activeModel.institution,
          startYear: this.activeModel.startYear,
          familyIncomeRange: this.activeModel.familyIncomeRange,
          isFulltime: this.activeModel.isFulltime,
          yearsToCompleteDegree: this.activeModel.yearsToCompleteDegree,

          residencyType: this.activeModel.residencyType,
          livingConditionTypeEnum: this.activeModel.livingConditionTypeEnum,
          costOfAttendance: this.activeModel.costOfAttendance,
          grantsAndScholarships: this.activeModel.grantsAndScholarships,
          expectedFamilyContribution: this.activeModel.expectedFamilyContribution,

          optimizedOutOfPocketLinearPointsInput: this.activeModel.optimizedOutOfPocketLinearPointsInput,
          optimizedOutOfPocketLinearPoints: this.activeModel.optimizedOutOfPocketLinearPoints,
          educationFinancing: this.activeModel.educationFinancing,

          radiusInMiles: this.activeModel.radiusInMiles
        },
        this.props.userModel,
        this.activeModel.roiModelId
      );

    if (updatedCareerGoalOrError.isSuccess)
    {
      this.updateInternalStore(updatedCareerGoalOrError.getValue(), 3);
    }
    else
    {
      throw updatedCareerGoalOrError.getError();
    }
  }
  updateEducationCost(educationCostDto: EducationCostDto): void
  {
    // UPDATE MODEL
    const updatedEducationCostOrError: Result<Model> = Model.create
      (
        {
          userModel: null,
          name: this.activeModel.name,

          location: this.activeModel.location,
          occupation: this.activeModel.occupation,
          degreeLevel: this.activeModel.degreeLevel,
          degreeProgram: this.activeModel.degreeProgram,
          retirementAge: this.activeModel.retirementAge,
          careerGoalPathType: this.activeModel.careerGoalPathType,

          institution: educationCostDto.institution,
          startYear: educationCostDto.startYear,
          familyIncomeRange: educationCostDto.incomeRange,
          isFulltime: educationCostDto.isFulltime,
          yearsToCompleteDegree: educationCostDto.yearsToCompleteDegree,

          residencyType: this.activeModel.residencyType,
          livingConditionTypeEnum: this.activeModel.livingConditionTypeEnum,
          costOfAttendance: this.activeModel.costOfAttendance,
          grantsAndScholarships: this.activeModel.grantsAndScholarships,
          expectedFamilyContribution: this.activeModel.expectedFamilyContribution,

          optimizedOutOfPocketLinearPointsInput: this.activeModel.optimizedOutOfPocketLinearPointsInput,
          optimizedOutOfPocketLinearPoints: this.activeModel.optimizedOutOfPocketLinearPoints,
          educationFinancing: this.activeModel.educationFinancing,

          radiusInMiles: this.activeModel.radiusInMiles
        },
        this.props.userModel,
        this.activeModel.roiModelId
      );

    if (updatedEducationCostOrError.isSuccess)
    {
      this.updateInternalStore(updatedEducationCostOrError.getValue(), 4);
    }
    else
    {
      throw updatedEducationCostOrError.getError();
    }

    // UPDATE USER MODEL
    const updatedUserOrError: Result<UserModel> = UserModel.create
      (
        {
          currentAge: this.userModel.currentAge,
          occupation: this.userModel.occupation,
          location: this.userModel.location,
          educationLevel: this.userModel.educationLevel,
          incomeRange: (educationCostDto.incomeRange) ? educationCostDto.incomeRange : this.userModel.incomeRange
        }
      );

    if (updatedUserOrError.isSuccess)
    {
      this.props.userModel = updatedUserOrError.getValue();
      this.activeModel.updateModelUser(this.props.userModel);
      this.props.lastUpdated = new Date();
    }
    else
    {
      throw updatedUserOrError.getError();
    }
  }
  updateEducationFinancing(educationFinancingDto: EducationFinancingDto): void
  {
    const defaultProps: EducationFinancingProps = EducationFinancing.defaultProps;

    const educationFinancingOrError: Result<EducationFinancing> = EducationFinancing.create
      (
        {
          isTaxDependent: educationFinancingDto.isTaxDependent ?? defaultProps.isTaxDependent,
          prefersIncomeBasedRepayment: educationFinancingDto.prefersIncomeBasedRepayment ?? defaultProps.prefersIncomeBasedRepayment,
          outOfPocketExpensesByYear: educationFinancingDto.outOfPocketExpensesByYear ?? defaultProps.outOfPocketExpensesByYear,
          federalSubsidizedLoanAmountByYear: educationFinancingDto.federalSubsidizedLoanAmountByYear ?? defaultProps.federalSubsidizedLoanAmountByYear,
          federalUnsubsidizedLoanAmountByYear: educationFinancingDto.federalUnsubsidizedLoanAmountByYear ?? defaultProps.federalUnsubsidizedLoanAmountByYear,
          federalLoanAmountByYear: educationFinancingDto.federalLoanAmountByYear ?? defaultProps.federalLoanAmountByYear,
          privateLoanAmountByYear: educationFinancingDto.privateLoanAmountByYear ?? defaultProps.privateLoanAmountByYear,
          yearsToPayOffFederalLoan: educationFinancingDto.yearsToPayOffFederalLoan ?? defaultProps.yearsToPayOffFederalLoan,
          yearsToPayOffPrivateLoan: educationFinancingDto.yearsToPayOffPrivateLoan ?? defaultProps.yearsToPayOffPrivateLoan
        }
      );

    if (educationFinancingOrError.isSuccess)
    {
      // UPDATE MODEL
      const updatedEducationFinancingOrError: Result<Model> = Model.create
        (
          {
            userModel: null,
            name: this.activeModel.name,

            location: this.activeModel.location,
            occupation: this.activeModel.occupation,
            degreeLevel: this.activeModel.degreeLevel,
            degreeProgram: this.activeModel.degreeProgram,
            retirementAge: this.activeModel.retirementAge,
            careerGoalPathType: this.activeModel.careerGoalPathType,

            institution: this.activeModel.institution,
            startYear: this.activeModel.startYear,
            familyIncomeRange: this.activeModel.familyIncomeRange,
            isFulltime: this.activeModel.isFulltime,
            yearsToCompleteDegree: this.activeModel.yearsToCompleteDegree,

            residencyType: this.activeModel.residencyType,
            livingConditionTypeEnum: this.activeModel.livingConditionTypeEnum,
            costOfAttendance: this.activeModel.costOfAttendance,
            grantsAndScholarships: this.activeModel.grantsAndScholarships,
            expectedFamilyContribution: this.activeModel.expectedFamilyContribution,

            optimizedOutOfPocketLinearPointsInput: this.activeModel.optimizedOutOfPocketLinearPointsInput,
            optimizedOutOfPocketLinearPoints: this.activeModel.optimizedOutOfPocketLinearPoints,
            educationFinancing: educationFinancingOrError.getValue(),

            radiusInMiles: this.activeModel.radiusInMiles
          },
          this.props.userModel,
          this.activeModel.roiModelId
        );

      if (updatedEducationFinancingOrError.isSuccess)
      {
        this.updateInternalStore(updatedEducationFinancingOrError.getValue(), 5);
      }
      else
      {
        throw updatedEducationFinancingOrError.getError();
      }
    }
    else
    {
      throw educationFinancingOrError.getError();
    }
  }

  /* #endregion */





  isCurrentInformationValid(): boolean
  {
    const hasLocation: boolean = (this.props.userModel.location !== null && this.props.userModel.location !== undefined);
    const hasEducationLevelEnum: boolean = (this.props.userModel.educationLevel !== null && this.props.userModel.educationLevel !== undefined);

    return (hasLocation && hasEducationLevelEnum);
  }
  isCareerGoalValid(): boolean
  {
    const hasOccupation: boolean = (this.activeModel.occupation !== null && this.activeModel.occupation !== undefined);
    const hasDegreeLevel: boolean = (this.activeModel.degreeLevel !== null && this.activeModel.degreeLevel !== undefined);
    const hasDegreeProgram: boolean = (this.activeModel.degreeProgram !== null && this.activeModel.degreeProgram !== undefined);

    return (hasOccupation && hasDegreeLevel && hasDegreeProgram);
  }
  isEducationCostValid(): boolean
  {
    const hasInstitution: boolean = this.activeModel.institution !== null && this.activeModel.institution !== undefined;
    const hasStartYear: boolean = this.activeModel.startYear !== null && this.activeModel.startYear !== undefined;
    const hasIncomeRange: boolean = this.props.userModel.incomeRange !== null && this.props.userModel.incomeRange !== undefined;

    return hasInstitution && hasStartYear && hasIncomeRange;
  }



  /* #region OUT OF POCKET OPTIMIZER */

  async shouldCalculateOptimizedOutPocketLinearPoints(): Promise<boolean>
  {
    return this.activeModel.shouldCalculateOptimizedOutPocketLinearPoints().then((shouldRun: boolean) =>
    {
      if (!this.isCurrentInformationValid())
      {
        return false;
      }

      return shouldRun;
    });
  }

  shouldResetOptimizedOutPocketLinearPoints(): Promise<boolean>
  {
    return this.activeModel.shouldResetOptimizedOutPocketLinearPoints();
  }

  updateOptimizedOutOfPocketLinearPoints(optimizedOutOfPocketLinearPoints: OptimizedOutOfPocketLinearPoints): void
  {
    this.activeModel.updateOptimizedOutOfPocketLinearPoints(optimizedOutOfPocketLinearPoints);
  }

  /* #endregion */



  /* #region  INPUT/OUTPUT */

  calculateRoiCalculatorInput(): Promise<boolean>
  {
    return this.activeModel.calculateRoiCalculatorInput().then((shouldCalculatorRun: boolean) =>
    {
      if (!this.isCurrentInformationValid())
      {
        return false;
      }

      return shouldCalculatorRun;
    });
  }
  updateRoiCalculatorOutput(roiCalculatorOutput: RoiCalculatorOutputModel): void
  {
    this.activeModel.updateRoiCalculatorOutput(roiCalculatorOutput);
  }

  /* #endregion */



  toJSON = () =>
  {
    return {
      roiAggregateId: this._roiAggregateId.id.toValue(),
      activeRoiModelId: this._activeModelId.id.toValue(),
      userModel: this.userModel,
      roiModelList: this.modelList
    };
  };



  private updateInternalStore(model: Model, _from: number): void
  {
    // console.log('update Internal Store from', from);

    if (model)
    {
      const key: string = model.roiModelId.id.toString();

      this.store.set(key, model);
      this.setAcitiveModelFromId(model.roiModelId);
      this.props.lastUpdated = new Date();
    }
  }

  private setAcitiveModelFromId(roiModelId: RoiModelId)
  {
    this._activeModelId = roiModelId;
    this.activeModel.businessRules_Run_All();
  }

  private getDefaultModelName(): string
  {
    const defaultRoiModelCount: number = this.getCountOfDefaultModels();
    return `${Model.defaultProps.name} ${defaultRoiModelCount + 1}`;
  }

  private getCountOfDefaultModels(): number
  {
    let maxNumber: number = 0;

    for (const roiModel of this.store.values())
    {
      if (roiModel.name.startsWith(Model.defaultProps.name))
      {
        const ordinalFromName: string = roiModel.name.replace(Model.defaultProps.name, '').trim();
        const ordinal: number = (ordinalFromName.length === 0) ? 0 : parseInt(ordinalFromName, 10);

        maxNumber = (ordinal > maxNumber) ? ordinal : maxNumber;
      }
    }

    return maxNumber;
  }

}
