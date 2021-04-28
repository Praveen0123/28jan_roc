import { UserProfile } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { UserByIdWithDefault } from '../../models';
import { UserProfileRepoService, userProfileRepoService } from '../../repos/user-profile-repo.service';



export class UserProfileByIdOrDefaultUseCase implements IUseCase<UserByIdWithDefault, Promise<UserProfile>>
{

  private constructor
    (
      private repo: UserProfileRepoService
    )
  {

  }

  public static create(repo: UserProfileRepoService): UserProfileByIdOrDefaultUseCase
  {
    return new UserProfileByIdOrDefaultUseCase(repo);
  }

  async executeAsync(input: UserByIdWithDefault): Promise<UserProfile>
  {
    const userProfileOrError: Result<UserProfile> = await this.repo.getUserByIdOrDefault(input.userId, input.defaultUserProfile);

    // SUCCESS
    if (userProfileOrError.isSuccess)
    {
      return userProfileOrError.getValue();
    }

    // FAILURE
    throw userProfileOrError.getError();
  }

}

export const userProfileByIdOrDefaultUseCase: UserProfileByIdOrDefaultUseCase = UserProfileByIdOrDefaultUseCase.create(userProfileRepoService);
