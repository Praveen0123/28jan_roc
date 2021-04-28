import { IMapper, Result } from '@vantage-point/ddd-core';

import { OccupationModel } from '../domain';
import { OccupationModelDto } from '../models';


export class OccupationModelMapper implements IMapper<OccupationModel, OccupationModelDto>
{
  private constructor()
  {
  }

  public static create(): OccupationModelMapper
  {
    return new OccupationModelMapper();
  }

  toDTO(input: OccupationModel): OccupationModelDto
  {
    const dto: OccupationModelDto =
    {
      onetCode: input.onetCode,
      title: input.title,
      typicalEducationLevelGroupId: input.typicalEducationLevelGroupId
    };

    return dto;
  }
  toDomain(input: OccupationModelDto): Result<OccupationModel>
  {
    return OccupationModel.create
      (
        {
          onetCode: input?.onetCode ?? OccupationModel.defaultProps.onetCode,
          title: input?.title ?? OccupationModel.defaultProps.title,
          typicalEducationLevelGroupId: input?.typicalEducationLevelGroupId ?? OccupationModel.defaultProps.typicalEducationLevelGroupId
        }
      );
  }
}
