import { RoiAggregateModel } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateParameters } from '../../models';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class GetRoiAggregateUseCase implements IUseCase<RoiAggregateParameters, Promise<RoiAggregateModel>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {
  }

  public static create(repo: RoiAggregateRepoService): GetRoiAggregateUseCase
  {
    return new GetRoiAggregateUseCase(repo);
  }

  async executeAsync(input: RoiAggregateParameters): Promise<RoiAggregateModel>
  {
    const roiAggregateOrError: Result<RoiAggregateModel> = await this.repo.getRoiAggregate(input.tenantId, input.userId, input.roiAggregateId);

    // SUCCESS
    if (roiAggregateOrError.isSuccess)
    {
      return roiAggregateOrError.getValue();
    }

    // FAILURE
    throw roiAggregateOrError.getError();
  }

}

export const getRoiAggregateUseCase: GetRoiAggregateUseCase = GetRoiAggregateUseCase.create(roiAggregateRepoService);
