import { Entity, Guard, Result } from '@vantage-point/ddd-core';


export interface OccupationModelProps
{
  onetCode: string;
  title: string;
  typicalEducationLevelGroupId: number;
}

export class OccupationModel extends Entity<OccupationModelProps>
{
  get onetCode(): string
  {
    return this.props.onetCode;
  }
  get title(): string
  {
    return this.props.title;
  }
  get typicalEducationLevelGroupId(): number
  {
    return this.props.typicalEducationLevelGroupId;
  }


  private constructor(props: OccupationModelProps)
  {
    super(props);
  }

  static create(props: OccupationModelProps): Result<OccupationModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<OccupationModel>(propsResult.message || 'user model properties error');
    }

    const model = new OccupationModel
      (
        {
          ...props
        }
      );

    return Result.success<OccupationModel>(model);
  }

  static get defaultProps(): OccupationModelProps
  {
    const props: OccupationModelProps =
    {
      onetCode: null,
      title: null,
      typicalEducationLevelGroupId: null
    };

    return props;
  }
}
