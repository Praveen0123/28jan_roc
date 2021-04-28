import { UserProfile, UserProfileInput } from '@roc-modeling-gateway-models';
import { Result } from '@vantage-point/ddd-core';
import { QueryResult } from 'pg';

import { BaseRepository } from '../../../core/base-repository';
import { UserProfileError } from '../errors';
import { UserProfileMapper } from '../mappers';

export class UserProfileRepoService extends BaseRepository
{

  private constructor()
  {
    super();
  }

  static create(): UserProfileRepoService
  {
    return new UserProfileRepoService();
  }

  async getUserById(id: string): Promise<Result<UserProfile>>
  {
    try
    {
      const queryName: string = 'GetUserById';
      const query = `SELECT "public"."${queryName}"($1)`;
      const queryResult: QueryResult<UserProfile> = await this.querySingleRecord<UserProfile>(query, id);
      const userProfile: UserProfile = UserProfileMapper.toUserProfile<UserProfile>(queryResult, queryName);

      if (userProfile)
      {
        return Result.success<UserProfile>(userProfile);
      }

      throw 'User profile could not be found';
    }
    catch (error)
    {
      const message = `ERROR | ${id} | ${error}`;
      const userProfileError: UserProfileError = new UserProfileError(message);

      return Result.failure<UserProfile>(userProfileError);
    }
  }

  async getUserByIdOrDefault(id: string, defaultUserProfile: UserProfileInput): Promise<Result<UserProfile>>
  {
    try
    {
      const queryName: string = 'GetUserById';
      const query = `SELECT "public"."${queryName}"($1)`;
      const queryResult: QueryResult<UserProfile> = await this.querySingleRecord<UserProfile>(query, id);
      const userProfile: UserProfile = UserProfileMapper.toUserProfile<UserProfile>(queryResult, queryName);

      if (userProfile)
      {
        return Result.success<UserProfile>(userProfile);
      }

      // IF MOST RECENT ROI AGREGATE DOES NOT EXIST, THEN CREATE A DEFALT ONE
      const defaultUserProfileOrError: Result<UserProfile> = await this.saveUseProfile(defaultUserProfile);

      if (defaultUserProfileOrError.isSuccess)
      {
        return Result.success<UserProfile>(defaultUserProfileOrError.getValue());
      }

      throw defaultUserProfileOrError.getError();
    }
    catch (error)
    {
      const message = `ERROR | ${id} | ${error}`;
      const userProfileError: UserProfileError = new UserProfileError(message);

      return Result.failure<UserProfile>(userProfileError);
    }
  }

  async saveUseProfile(userProfileInput: UserProfileInput): Promise<Result<UserProfile>>
  {
    try
    {
      const queryName: string = 'SaveUserProfile';
      const query = `SELECT "public"."${queryName}"($1, $2, $3, $4, $5, $6, $7)`;
      const params =
        [
          userProfileInput.id,
          userProfileInput.emailAddress,
          userProfileInput.firstName,
          userProfileInput.lastName,
          userProfileInput.userType,
          userProfileInput.highSchoolId,
          userProfileInput.hasCompletedOnboarding
        ];
      const queryResult: QueryResult<UserProfile> = await this.query<UserProfile>(query, params);
      const userProfile: UserProfile = UserProfileMapper.toUserProfile<UserProfile>(queryResult, queryName);

      if (userProfile)
      {
        return Result.success<UserProfile>(userProfile);
      }

      throw ('Could not save user');
    }
    catch (error)
    {
      const message = `ERROR | ${error.message}`;
      const userProfileError: UserProfileError = new UserProfileError(message);

      return Result.failure<UserProfile>(userProfileError);
    }
  }

}


export const userProfileRepoService: UserProfileRepoService = UserProfileRepoService.create();
