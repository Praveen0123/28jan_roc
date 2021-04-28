import { Entity, Guard, Result } from '@vantage-point/ddd-core';


export interface LocationModelProps
{
  zipCode: string;
}

export class LocationModel extends Entity<LocationModelProps>
{
  get zipCode(): string
  {
    return this.props.zipCode;
  }

  private constructor(props: LocationModelProps)
  {
    super(props);
  }

  static create(props: LocationModelProps): Result<LocationModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<LocationModel>(propsResult.message || 'user model properties error');
    }

    const model = new LocationModel
      (
        {
          ...props
        }
      );

    return Result.success<LocationModel>(model);
  }

  static get defaultProps(): LocationModelProps
  {
    const props: LocationModelProps =
    {
      zipCode: null,
    };

    return props;
  }
}
