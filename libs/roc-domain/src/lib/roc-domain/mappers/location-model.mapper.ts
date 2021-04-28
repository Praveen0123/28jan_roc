import { IMapper, Result } from '@vantage-point/ddd-core';

import { LocationModel } from '../domain';
import { LocationModelDto } from '../models';


export class LocationModelMapper implements IMapper<LocationModel, LocationModelDto>
{
  private constructor()
  {
  }

  public static create(): LocationModelMapper
  {
    return new LocationModelMapper();
  }

  toDTO(input: LocationModel): LocationModelDto
  {
    const dto: LocationModelDto =
    {
      zipCode: input.zipCode
    };

    return dto;
  }
  toDomain(input: LocationModelDto): Result<LocationModel>
  {
    return LocationModel.create
      (
        {
          zipCode: input?.zipCode ?? LocationModel.defaultProps.zipCode
        }
      );
  }
}
