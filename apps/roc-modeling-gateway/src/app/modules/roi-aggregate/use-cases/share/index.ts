import { RoiAggregateModel, ShareInput } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';
import { EmailService, emailService } from 'apps/roc-modeling-gateway/src/app/core/email-manager';

import { Auth0UserForSharingModel, Auth0UserRepoService, auth0UserRepoService } from '../../../user-profile/repos/auth0-repo.service';
import { RoiModelError } from '../../errors';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class ShareUseCase implements IUseCase<ShareInput, Promise<RoiAggregateModel>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService,
      private userRepo: Auth0UserRepoService,
      private emailService: EmailService
    )
  {
  }


  public static create(repo: RoiAggregateRepoService, userRepo: Auth0UserRepoService, emailService: EmailService): ShareUseCase
  {
    return new ShareUseCase(repo, userRepo, emailService);
  }

  async executeAsync(input: ShareInput): Promise<RoiAggregateModel>
  {
    try
    {
      const auth0UserForSharingOrError: Result<Auth0UserForSharingModel> = await this.userRepo.getOrCreateUserForSharingModelAsync(input);

      // SUCCESS
      if (auth0UserForSharingOrError.isSuccess)
      {
        const auth0UserForSharingModel: Auth0UserForSharingModel = auth0UserForSharingOrError.getValue();

        // SAVE SHARE ASSIGNMENT
        const roiAggregateOrError: Result<RoiAggregateModel> = await this.repo.saveShare(input, auth0UserForSharingModel.userProfile);


        if (auth0UserForSharingModel.isNewAuth0User)
        {
          // SEND WELCOME EMAIL:
          await this.emailService.sendWelcomeEmailAsync(input);
        }
        else
        {
          // SEND SHARE WITH EXISTING USER EMAIL:
          await this.emailService.sendShareWithExistingUserEmailAsync(input);
        }


        // YAY SUCCESS!!!
        if (roiAggregateOrError.isSuccess)
        {
          return roiAggregateOrError.getValue();
        }

        // FAILURE
        throw roiAggregateOrError.getError();
      }

      // FAILURE
      throw auth0UserForSharingOrError.getError();
    }
    catch (error)
    {
      throw new RoiModelError(error);
    }
  }
}

export const shareUseCase: ShareUseCase = ShareUseCase.create(roiAggregateRepoService, auth0UserRepoService, emailService);
