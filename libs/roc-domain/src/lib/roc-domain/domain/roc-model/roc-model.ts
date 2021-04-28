import { Entity, Guard, Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../../config/config';
import { EducationLevelEnum, LivingConditionTypeEnum, ResidencyTypeEnum } from '../../models';
import { GrantsModel } from '../../models/interfaces';
import { EducationFinancingModel } from '../education-financing-model';
import { InstitutionModel } from '../institution-model';
import { InstructionalProgramModel } from '../instructional-program-model';
import { LocationModel } from '../location-model';
import { OccupationModel } from '../occupation-model';
import { RocModelId } from './roc-model-id';


export interface RocModelProps
{
  name: string;

  locationModel: LocationModel;
  occupationModel: OccupationModel;
  degreeLevel: EducationLevelEnum;
  degreeProgram: InstructionalProgramModel;
  retirementAge: number;

  institutionModel: InstitutionModel;
  startYear: number;
  isFulltime: boolean;
  yearsToCompleteDegree: number;

  residencyType: ResidencyTypeEnum;
  livingConditionTypeEnum: LivingConditionTypeEnum;
  grantsModel: GrantsModel;

  educationFinancingModel?: EducationFinancingModel;

  radiusInMiles?: number;
}


export class RocModel extends Entity<RocModelProps>
{

  /* #region  PROPERTIES */

  private _rocModelId: RocModelId;

  get roiModelId(): RocModelId
  {
    return this._rocModelId;
  }
  get name(): string
  {
    return this.props.name;
  }

  get locationModel(): LocationModel
  {
    return this.props.locationModel;
  }
  get occupationModel(): OccupationModel
  {
    return this.props.occupationModel;
  }
  get degreeLevel(): EducationLevelEnum
  {
    return this.props.degreeLevel;
  }
  get degreeProgram(): InstructionalProgramModel
  {
    return this.props.degreeProgram;
  }
  get retirementAge(): number
  {
    return this.props.retirementAge;
  }


  get institutionModel(): InstitutionModel
  {
    return this.props.institutionModel;
  }
  get institutionName(): string
  {
    return this.props.institutionModel.name;
  }
  get startYear(): number
  {
    return this.props.startYear;
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
  get grantsModel(): GrantsModel
  {
    return this.props.grantsModel;
  }


  get educationFinancingModel(): EducationFinancingModel
  {
    return this.props.educationFinancingModel;
  }

  get radiusInMiles(): number
  {
    return this.props.radiusInMiles;
  }

  /* #endregion */


  private constructor(props: RocModelProps, roiModelId?: RocModelId)
  {
    super(props, roiModelId?.id);

    this._rocModelId = RocModelId.create(this._id);
  }

  static create(props: RocModelProps, id?: RocModelId): Result<RocModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<RocModel>(propsResult.message || 'roi model properties error');
    }

    RocModel.businessRules_Update_DegreeLevel(props);
    RocModel.businessRules_Update_Default_Name_To_Institution_Name(props);

    const model = new RocModel
      (
        {
          ...props
        },
        id
      );

    return Result.success<RocModel>(model);
  }
  static get defaultProps(): RocModelProps
  {
    const educationFinancingOrError: Result<EducationFinancingModel> = EducationFinancingModel.create(EducationFinancingModel.defaultProps);

    const props: RocModelProps =
    {
      name: 'Default ROC Model',

      locationModel: null,
      occupationModel: null,
      degreeLevel: EducationLevelEnum.HighSchoolGraduate,
      degreeProgram: null,
      retirementAge: CONFIG.CAREER_GOAL.DEFAULT_RETIREMENT_AGE,

      institutionModel: null,
      startYear: new Date().getFullYear(),
      isFulltime: true,
      yearsToCompleteDegree: CONFIG.EDUCATION_COST.YEARS_TO_COMPLETE_DEFAULT,

      residencyType: ResidencyTypeEnum.UNKNOWN,
      livingConditionTypeEnum: LivingConditionTypeEnum.UNKNOWN,
      grantsModel: null,

      educationFinancingModel: (educationFinancingOrError.isSuccess) ? educationFinancingOrError.getValue() : null,

      radiusInMiles: CONFIG.USER_PROFILE.RADIUS_IN_MILES
    };

    return props;
  }
  static businessRules_Update_DegreeLevel(props: RocModelProps): void
  {
    if (props.occupationModel && props.occupationModel.typicalEducationLevelGroupId)
    {
      const defaultEducationLevelEnum: EducationLevelEnum = EducationLevelEnum.getEducationLevelByGroupId(props.occupationModel.typicalEducationLevelGroupId);

      props.degreeLevel = defaultEducationLevelEnum;
      // console.log('OVERRIDE EDUCATION LEVEL', defaultEducationLevelEnum);
    }
  }
  static businessRules_Update_Default_Name_To_Institution_Name(props: RocModelProps): void
  {
    if (props.name.startsWith(RocModel.defaultProps.name) && props.institutionModel)
    {
      props.name = props.institutionModel.name;
    }
  }


  updateModelName(name: string)
  {
    this.props.name = name;
  }

  businessRules_Update_Default_LocationModel(locationModel: LocationModel): void
  {
    if (this.props.locationModel == null && locationModel != null)
    {
      this.props.locationModel = locationModel;
    }
  }

  businessRules_Update_Default_OccupationModel(occupationModel: OccupationModel): void
  {
    if (this.props.occupationModel == null && occupationModel != null)
    {
      this.props.occupationModel = occupationModel;
    }
  }
}
