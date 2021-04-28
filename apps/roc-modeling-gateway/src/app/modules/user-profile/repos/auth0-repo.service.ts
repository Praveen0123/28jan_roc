import { ShareInput, UserProfile, UserProfileInput } from '@roc-modeling-gateway-models';
import { Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../../../config/config';
import { Auth0Manager } from '../../../core/auth0-manager';
import { UserProfileError } from '../errors';
import { UserProfileRepoService, userProfileRepoService } from './user-profile-repo.service';

const got = require('got');


export interface Auth0UserForSharingModel
{
  isNewAuth0User: boolean;
  userProfile: UserProfile;
}

export class Auth0UserRepoService extends Auth0Manager
{

  private constructor
    (
      private repo: UserProfileRepoService
    )
  {
    super();
  }

  static create(repo: UserProfileRepoService): Auth0UserRepoService
  {
    return new Auth0UserRepoService(repo);
  }

  async getAuth0UserIdAsync(emailAddress: string): Promise<Result<string>>
  {
    if (!CONFIG.AUTH0.API_USERS)
    {
      throw new Error(' ********** Please check environment configuration.  Looks like missing an AUTH0 API variable ********** ');
    }

    try
    {
      const url: string = `${CONFIG.AUTH0.API_USERS}?q=${emailAddress}`;

      const { body } = await got.get(url,
        {
          headers: { authorization: super.auth0Token.token },
          responseType: 'json'
        });

      if (body && body.length > 0)
      {
        return Result.success<string>(body[0].user_id);
      }

      throw (`AUTH0 user (${emailAddress}) does not exist`);
    }
    catch (err)
    {
      const message = `ERROR | GET AUTH0 USER ID: ${err.message}`;
      const error: UserProfileError = new UserProfileError(message);

      return Result.failure<string>(error);
    }
  }

  async createAuth0UserAsync(input: ShareInput): Promise<Result<string>>
  {
    if (!CONFIG.AUTH0.API_USERS)
    {
      throw new Error(' ********** Please check environment configuration.  Looks like missing an AUTH0 API variable ********** ');
    }

    try
    {
      const url: string = `${CONFIG.AUTH0.API_USERS}`;

      // CREATE:
      const newUser = await got.post(url,
        {
          headers: { authorization: super.auth0Token.token },
          json:
          {
            "email": input.emailAddress,
            "given_name": input.firstName,
            "family_name": input.lastName,
            "name": `${input.firstName} ${input.lastName}`,
            "connection": "email",
            "email_verified": true,
            "app_metadata":
            {
              "mostRecentTenantHost": input.tenantHostName
            }
          },
          responseType: 'json'
        });

      return Result.success<string>(newUser.body.user_id);
    }
    catch (err)
    {
      const message = `ERROR | CREATE AUTH0: ${err}`;
      const error: UserProfileError = new UserProfileError(message);

      return Result.failure<string>(error);
    }
  }

  async getOrCreateUserForSharingModelAsync(input: ShareInput): Promise<Result<Auth0UserForSharingModel>>
  {
    try
    {
      let isNewAuth0User: boolean = false;
      let auth0UserId: string = undefined;
      const auth0UserIdOrError: Result<string> = await this.getAuth0UserIdAsync(input.emailAddress);

      // GET OR CREATE AUTH0 USER
      if (auth0UserIdOrError.isSuccess)
      {
        auth0UserId = auth0UserIdOrError.getValue();
      }
      else
      {
        const createAuth0UserOrError: Result<string> = await this.createAuth0UserAsync(input);

        if (createAuth0UserOrError.isSuccess)
        {
          auth0UserId = createAuth0UserOrError.getValue();
          isNewAuth0User = true;
        }
        else
        {
          throw createAuth0UserOrError.getError();
        }
      }

      // GET OR CREATE USER FROM DATA STORE
      const userProfileInput: UserProfileInput =
      {
        id: auth0UserId,
        emailAddress: input.emailAddress,
        firstName: input.firstName,
        lastName: input.lastName,
        userType: input.userType,
        highSchoolId: null,
        hasCompletedOnboarding: false
      };

      const userProfileOrError: Result<UserProfile> = await this.repo.getUserByIdOrDefault(auth0UserId, userProfileInput);

      if (userProfileOrError.isSuccess)
      {
        const auth0UserForSharingModel: Auth0UserForSharingModel =
        {
          isNewAuth0User: isNewAuth0User,
          userProfile: userProfileOrError.getValue()
        };

        return Result.success<Auth0UserForSharingModel>(auth0UserForSharingModel);
      }

      throw ('Get or Create User failed');
    }
    catch (error)
    {
      return Result.failure<Auth0UserForSharingModel>(error);
    }
  }

}


export const auth0UserRepoService: Auth0UserRepoService = Auth0UserRepoService.create(userProfileRepoService);
