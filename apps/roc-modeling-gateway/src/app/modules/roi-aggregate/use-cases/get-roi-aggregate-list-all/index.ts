import { RoiAggregateCardModel } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateParameters } from '../../models';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class GetRoiAggregateListAllUseCase implements IUseCase<RoiAggregateParameters, Promise<RoiAggregateCardModel[]>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {
  }

  public static create(repo: RoiAggregateRepoService): GetRoiAggregateListAllUseCase
  {
    return new GetRoiAggregateListAllUseCase(repo);
  }

  async executeAsync(input: RoiAggregateParameters): Promise<RoiAggregateCardModel[]>
  {
    const roiAggregateListOrError: Result<RoiAggregateCardModel[]> = await this.repo.getRoiAggregateListAll(input.tenantId, input.userId);

    // SUCCESS
    if (roiAggregateListOrError.isSuccess)
    {
      return roiAggregateListOrError.getValue();
    }

    // FAILURE
    throw roiAggregateListOrError.getError();
  }

}

export const getRoiAggregateListAllUseCase: GetRoiAggregateListAllUseCase = GetRoiAggregateListAllUseCase.create(roiAggregateRepoService);
