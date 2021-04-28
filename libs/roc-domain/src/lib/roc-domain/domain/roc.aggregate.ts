import { AggregateRoot, Guard, Result, UniqueEntityID } from '@vantage-point/ddd-core';

import { RocAggregateMissingError } from '../errors';
import { RocModelCloneDataToKeepModel } from '../models';
import { RocAggregateId } from './roc-aggregate-id';
import { RocModel, RocModelId, RocModelProps } from './roc-model';
import { UserModel } from './user-model';


interface RocAggregateProps
{
  name: string;
  userModel: UserModel;
  rocModel?: RocModel;
  dateCreated?: Date;
  lastUpdated?: Date;
}


export class RocAggregate extends AggregateRoot<RocAggregateProps>
{
  private _rocAggregateId: RocAggregateId;
  private _activeRocModelId: RocModelId;
  private store: Map<string, RocModel> = new Map();


  /* #region  PROPS */

  get rocAggregateId(): string
  {
    return this._rocAggregateId.id.toString();
  }
  get name(): string
  {
    return this.props.name;
  }
  get userModel(): UserModel
  {
    return this.props.userModel;
  }
  get activeModel(): RocModel
  {
    const key: string = this._activeRocModelId.id.toString();

    if (this.store.has(key))
    {
      return this.store.get(key);
    }

    throw RocAggregateMissingError.create('ROC AGGREGATE IS MISSING MODEL');
  }
  get rocModelList(): RocModel[]
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


  private constructor(props: RocAggregateProps, id?: UniqueEntityID)
  {
    super(props, id);

    this._rocAggregateId = RocAggregateId.create(this._id);

    this.updateInternalStore(props.rocModel, 0);
  }

  static create(props: RocAggregateProps, id?: UniqueEntityID): Result<RocAggregate>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<RocAggregate>(propsResult.message || 'roi aggregate properties error');
    }

    const roiAggregate = new RocAggregate
      (
        {
          ...props
        },
        id
      );

    return Result.success<RocAggregate>(roiAggregate);
  }

  static get defaultProps(): RocAggregateProps
  {
    const defaultName: string = 'ROI Collection';
    const userModelOrError: Result<UserModel> = UserModel.create(UserModel.defaultProps);

    if (userModelOrError.isSuccess)
    {
      const userModel: UserModel = userModelOrError.getValue();
      const rocModelOrFailure: Result<RocModel> = RocModel.create(RocModel.defaultProps);

      if (rocModelOrFailure.isSuccess)
      {
        const props: RocAggregateProps =
        {
          name: defaultName,
          userModel: userModel,
          rocModel: rocModelOrFailure.getValue(),
          dateCreated: new Date(),
          lastUpdated: new Date()
        };

        return props;
      }
    }

    return {
      name: defaultName,
      userModel: null,
      rocModel: null,
      dateCreated: new Date(),
      lastUpdated: new Date()
    };
  }


  createNewRocModel(name?: string): void
  {
    const rocModelOrFailure: Result<RocModel> = RocModel.create
      (
        {
          ...RocModel.defaultProps,
          name: name ?? this.getDefaultModelName()
        }
      );

    if (rocModelOrFailure.isSuccess)
    {
      this.updateInternalStore(rocModelOrFailure.getValue(), 1);
    }
    else
    {
      throw rocModelOrFailure.getError();
    }
  }
  cloneRocModel(cloneDataToKeepModel: RocModelCloneDataToKeepModel): void
  {
    const defaultProps: RocModelProps = RocModel.defaultProps;

    const cloneOrError: Result<RocModel> = RocModel.create
      (
        {
          name: cloneDataToKeepModel.modelName,

          locationModel: (cloneDataToKeepModel.isGoalLocationCloned) ? this.activeModel.locationModel : defaultProps.locationModel,
          occupationModel: (cloneDataToKeepModel.isGoalOccupationCloned) ? this.activeModel.occupationModel : defaultProps.occupationModel,
          degreeLevel: (cloneDataToKeepModel.isGoalDegreeLevelCloned) ? this.activeModel.degreeLevel : defaultProps.degreeLevel,
          degreeProgram: (cloneDataToKeepModel.isGoalDegreeProgramCloned) ? this.activeModel.degreeProgram : defaultProps.degreeProgram,
          retirementAge: (cloneDataToKeepModel.isGoalRetirementAgeCloned) ? this.activeModel.retirementAge : defaultProps.retirementAge,

          institutionModel: (cloneDataToKeepModel.isEducationCostInstitutionCloned) ? this.activeModel.institutionModel : defaultProps.institutionModel,
          startYear: (cloneDataToKeepModel.isEducationCostStartSchoolCloned) ? this.activeModel.startYear : defaultProps.startYear,
          isFulltime: (cloneDataToKeepModel.isEducationCostPartTimeFullTimeCloned) ? this.activeModel.isFulltime : defaultProps.isFulltime,
          yearsToCompleteDegree: (cloneDataToKeepModel.isEducationCostYearsToCompleteCloned) ? this.activeModel.yearsToCompleteDegree : defaultProps.yearsToCompleteDegree,

          residencyType: this.activeModel.residencyType,
          livingConditionTypeEnum: this.activeModel.livingConditionTypeEnum,
          grantsModel: this.activeModel.grantsModel,

          educationFinancingModel: this.activeModel.educationFinancingModel,

          radiusInMiles: this.activeModel.radiusInMiles
        },
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
      this.setAcitiveModelFromId(RocModelId.create(key));
    }
    else
    {
      const message: string = `ROC Aggregate's RocModel (${key}) does not exist`;
      throw RocAggregateMissingError.create(message);
    }
  }
  deleteRocModel(rocModelId: RocModelId): void
  {
    const key: string = rocModelId.id.toString();
    const activeKey: string = this._activeRocModelId.id.toString();

    if (this.store.has(key))
    {
      this.store.delete(key);

      // IF STORE IS EMPTY, CREATE A NEW ROI MODEL
      if (this.store.size === 0)
      {
        this.createNewRocModel();
      }

      // IF MODEL BEING DELETED IS ACTIVE MODEL, THEN FIND NEW ACTIVE
      else if (key === activeKey)
      {
        const nextModel: RocModel = this.rocModelList[0];

        this.setAcitiveModelFromId(nextModel.roiModelId);
      }

      this.props.lastUpdated = new Date();
    }
  }
  loadModelList(list: RocModel[]): void
  {
    list.map((item: RocModel) =>
    {
      const key: string = item.roiModelId.id.toString();
      this.store.set(key, item);
    });
  }

  renameRocAggregate(name: string)
  {
    this.props.name = name;
    this.props.lastUpdated = new Date();
  }
  renameRocModel(name: string)
  {
    this.activeModel.updateModelName(name);
    this.props.lastUpdated = new Date();
  }
  updateUserModel(userModel: UserModel)
  {
    this.props.userModel = userModel;
    this.runBusinessRulesOnActiveModel();

    this.props.lastUpdated = new Date();
  }


  toJSON = () =>
  {
    return {
      rocAggregateId: this._rocAggregateId.id.toValue(),
      name: this.name,
      userModel: this.userModel,
      activeRocModelId: this._activeRocModelId.id.toValue(),
      rocModelList: this.rocModelList
    };
  };



  private updateInternalStore(model: RocModel, _from: number): void
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

  private setAcitiveModelFromId(roiModelId: RocModelId)
  {
    this._activeRocModelId = roiModelId;

    this.runBusinessRulesOnActiveModel();
  }

  private getDefaultModelName(): string
  {
    const defaultRoiModelCount: number = this.getCountOfDefaultModels();
    return `${RocModel.defaultProps.name} ${defaultRoiModelCount + 1}`;
  }

  private getCountOfDefaultModels(): number
  {
    let maxNumber: number = 0;

    for (const roiModel of this.store.values())
    {
      if (roiModel.name.startsWith(RocModel.defaultProps.name))
      {
        const ordinalFromName: string = roiModel.name.replace(RocModel.defaultProps.name, '').trim();
        const ordinal: number = (ordinalFromName.length === 0) ? 0 : parseInt(ordinalFromName, 10);

        maxNumber = (ordinal > maxNumber) ? ordinal : maxNumber;
      }
    }

    return maxNumber;
  }

  private runBusinessRulesOnActiveModel()
  {
    this.activeModel.businessRules_Update_Default_LocationModel(this.props.userModel.locationModel);
    this.activeModel.businessRules_Update_Default_OccupationModel(this.props.userModel.occupationModel);
  }

}
