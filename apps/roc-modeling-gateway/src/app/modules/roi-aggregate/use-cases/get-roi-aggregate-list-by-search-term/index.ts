import { RoiAggregateCardModel } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateSearchParameters } from '../../models';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class GetRoiAggregateListBySearchTermUseCase implements IUseCase<RoiAggregateSearchParameters, Promise<RoiAggregateCardModel[]>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {
  }

  public static create(repo: RoiAggregateRepoService): GetRoiAggregateListBySearchTermUseCase
  {
    return new GetRoiAggregateListBySearchTermUseCase(repo);
  }

  async executeAsync(input: RoiAggregateSearchParameters): Promise<RoiAggregateCardModel[]>
  {
    const roiAggregateListOrError: Result<RoiAggregateCardModel[]> = await this.repo.getRoiAggregateListBySearchTerm(input.tenantId, input.userId, input.searchTerm);

    // SUCCESS
    if (roiAggregateListOrError.isSuccess)
    {
      return roiAggregateListOrError.getValue();
    }

    // FAILURE
    throw roiAggregateListOrError.getError();
  }

}

export const getRoiAggregateListBySearchTermUseCase: GetRoiAggregateListBySearchTermUseCase = GetRoiAggregateListBySearchTermUseCase.create(roiAggregateRepoService);
