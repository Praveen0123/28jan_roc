import { CONFIG } from '@app/config/config';
import { EducationLevelEnum, IncomeRangeEnum } from '@app/core/models';
import { Location, Occupation } from '@gql';
import { Entity, Guard, Result } from '@vantage-point/ddd-core';


export interface UserModelProps
{
  currentAge: number;
  occupation?: Occupation;
  location: Location;
  educationLevel: EducationLevelEnum;
  incomeRange: IncomeRangeEnum;
}

export class UserModel extends Entity<UserModelProps>
{
  get currentAge(): number
  {
    return this.props.currentAge;
  }
  get occupation(): Occupation
  {
    return this.props.occupation;
  }
  get location(): Location
  {
    return this.props.location;
  }
  get educationLevel(): EducationLevelEnum
  {
    return this.props.educationLevel;
  }
  get incomeRange(): IncomeRangeEnum
  {
    return this.props.incomeRange;
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
      occupation: null,
      location: null,
      educationLevel: null,
      incomeRange: IncomeRangeEnum.UNKNOWN
    };

    return props;
  }
}
