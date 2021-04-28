import { IMapper, Result } from '@vantage-point/ddd-core';

import { LocationModel, OccupationModel, UserModel } from '../domain';
import { UserModelDto } from '../models';
import { LocationModelMapper } from './location-model.mapper';
import { OccupationModelMapper } from './occupation-model.mapper';



export class UserModelMapper implements IMapper<UserModel, UserModelDto>
{

  private constructor()
  {
  }

  public static create(): UserModelMapper
  {
    return new UserModelMapper();
  }

  toDTO(input: UserModel): UserModelDto
  {
    const userModelDto: UserModelDto =
    {
      currentAge: input.currentAge,
      occupationModel: OccupationModelMapper.create().toDTO(input.occupationModel),
      locationModel: LocationModelMapper.create().toDTO(input.locationModel),
      educationLevel: input.educationLevel,
      incomeRange: input.incomeRange,
      expectedFamilyContribution: input.expectedFamilyContribution
    };

    return userModelDto;
  }

  toDomain(input: UserModelDto): Result<UserModel>
  {
    const occupationModelOrFailure: Result<OccupationModel> = OccupationModelMapper.create().toDomain(input.occupationModel);
    const locationModelOrFailure: Result<LocationModel> = LocationModelMapper.create().toDomain(input.locationModel);

    const occupationModel: OccupationModel = (occupationModelOrFailure.isSuccess) ? occupationModelOrFailure.getValue() : UserModel.defaultProps.occupationModel;
    const locationModel: LocationModel = (locationModelOrFailure.isSuccess) ? locationModelOrFailure.getValue() : UserModel.defaultProps.locationModel;

    return UserModel.create
      (
        {
          currentAge: input?.currentAge ?? UserModel.defaultProps.currentAge,
          occupationModel: occupationModel,
          locationModel: locationModel,
          educationLevel: input?.educationLevel ?? UserModel.defaultProps.educationLevel,
          incomeRange: input?.incomeRange ?? UserModel.defaultProps.incomeRange,
          expectedFamilyContribution: input.expectedFamilyContribution ?? UserModel.defaultProps.expectedFamilyContribution
        }
      );
  }

}
