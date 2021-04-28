import { RoiAggregateModel } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateParametersWithDefault } from '../../models';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class GetRoiAggregateMostRecentUseCase implements IUseCase<RoiAggregateParametersWithDefault, Promise<RoiAggregateModel>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {
  }

  public static create(repo: RoiAggregateRepoService): GetRoiAggregateMostRecentUseCase
  {
    return new GetRoiAggregateMostRecentUseCase(repo);
  }

  async executeAsync(input: RoiAggregateParametersWithDefault): Promise<RoiAggregateModel>
  {
    const roiAggregateOrError: Result<RoiAggregateModel> = await this.repo.getRoiAggregateMostRecent(input.tenantId, input.userId, input.defaultRoiAggregate);

    // SUCCESS
    if (roiAggregateOrError.isSuccess)
    {
      return roiAggregateOrError.getValue();
    }

    // FAILURE
    throw roiAggregateOrError.getError();
  }

}

export const getRoiAggregateMostRecentUseCase: GetRoiAggregateMostRecentUseCase = GetRoiAggregateMostRecentUseCase.create(roiAggregateRepoService);
