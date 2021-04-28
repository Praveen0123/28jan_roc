import { Entity, Guard, Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../../config/config';
import { EducationLevelEnum, IncomeRangeEnum } from '../../models';
import { LocationModel } from '../location-model';
import { OccupationModel } from '../occupation-model';


export interface UserModelProps
{
  currentAge: number;
  occupationModel?: OccupationModel;
  locationModel: LocationModel;
  educationLevel: EducationLevelEnum;
  incomeRange: IncomeRangeEnum;
  expectedFamilyContribution: number;
}

export class UserModel extends Entity<UserModelProps>
{
  get currentAge(): number
  {
    return this.props.currentAge;
  }
  get occupationModel(): OccupationModel
  {
    return this.props.occupationModel;
  }
  get locationModel(): LocationModel
  {
    return this.props.locationModel;
  }
  get educationLevel(): EducationLevelEnum
  {
    return this.props.educationLevel;
  }
  get incomeRange(): IncomeRangeEnum
  {
    return this.props.incomeRange;
  }
  get expectedFamilyContribution(): number
  {
    return this.props.expectedFamilyContribution;
  }


  private constructor(props: UserModelProps)
  {
    super(props);
  }

  static create(props: UserModelProps): Result<UserModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<UserModel>(propsResult.message || 'user model properties error');
    }

    const userModel = new UserModel
      (
        {
          ...props
        }
      );

    return Result.success<UserModel>(userModel);
  }

  static get defaultProps(): UserModelProps
  {
    const props: UserModelProps =
    {
      currentAge: CONFIG.USER_PROFILE.DEFAULT_AGE,
      occupationModel: null,
      locationModel: null,
      educationLevel: null,
      incomeRange: IncomeRangeEnum.UNKNOWN,
      expectedFamilyContribution: null
    };

    return props;
  }
}
