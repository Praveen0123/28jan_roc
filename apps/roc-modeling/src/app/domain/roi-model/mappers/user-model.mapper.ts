import { IMapper, Result } from '@vantage-point/ddd-core';

import { UserModel } from '../domain';
import { UserModelDto } from '../dtos';


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
      occupation: input.occupation,
      location: input.location,
      educationLevel: input.educationLevel,
      incomeRange: input.incomeRange
    };

    return userModelDto;
  }

  toDomain(input: UserModelDto): Result<UserModel>
  {
    return UserModel.create
      (
        {
          currentAge: input?.currentAge ?? null,
          occupation: input?.occupation ?? null,
          location: input?.location ?? null,
          educationLevel: input?.educationLevel ?? null,
          incomeRange: input?.incomeRange ?? null
        }
      );
  }

}
