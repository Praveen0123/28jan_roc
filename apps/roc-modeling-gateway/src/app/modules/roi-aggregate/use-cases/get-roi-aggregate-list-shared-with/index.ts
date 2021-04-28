import { RoiAggregateCardModel } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateParameters } from '../../models';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class GetRoiAggregateListSharedWithUseCase implements IUseCase<RoiAggregateParameters, Promise<RoiAggregateCardModel[]>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {
  }

  public static create(repo: RoiAggregateRepoService): GetRoiAggregateListSharedWithUseCase
  {
    return new GetRoiAggregateListSharedWithUseCase(repo);
  }

  async executeAsync(input: RoiAggregateParameters): Promise<RoiAggregateCardModel[]>
  {
    const roiAggregateListOrError: Result<RoiAggregateCardModel[]> = await this.repo.getRoiAggregateListSharedWith(input.tenantId, input.userId);

    // SUCCESS
    if (roiAggregateListOrError.isSuccess)
    {
      return roiAggregateListOrError.getValue();
    }

    // FAILURE
    throw roiAggregateListOrError.getError();
  }

}

export const getRoiAggregateListSharedWithUseCase: GetRoiAggregateListSharedWithUseCase = GetRoiAggregateListSharedWithUseCase.create(roiAggregateRepoService);
