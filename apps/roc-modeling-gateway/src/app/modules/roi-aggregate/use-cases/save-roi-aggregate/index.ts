import { RoiAggregateInput, RoiAggregateModel } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class SaveRoiAggregateUseCase implements IUseCase<RoiAggregateInput, Promise<RoiAggregateModel>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {

  }

  public static create(repo: RoiAggregateRepoService): SaveRoiAggregateUseCase
  {
    return new SaveRoiAggregateUseCase(repo);
  }

  async executeAsync(input: RoiAggregateInput): Promise<RoiAggregateModel>
  {
    const roiAggregateOrError: Result<RoiAggregateModel> = await this.repo.saveRoiAggregate(input);

    // SUCCESS
    if (roiAggregateOrError.isSuccess)
    {
      return roiAggregateOrError.getValue();
    }

    // FAILURE
    throw roiAggregateOrError.getError();
  }

}

export const saveRoiAggregateUseCase: SaveRoiAggregateUseCase = SaveRoiAggregateUseCase.create(roiAggregateRepoService);
