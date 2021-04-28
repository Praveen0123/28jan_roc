import { IUseCase, Result } from '@vantage-point/ddd-core';

import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class DeleteRoiAggregateUseCase implements IUseCase<string, Promise<boolean>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService
    )
  {

  }

  public static create(repo: RoiAggregateRepoService): DeleteRoiAggregateUseCase
  {
    return new DeleteRoiAggregateUseCase(repo);
  }

  async executeAsync(input: string): Promise<boolean>
  {
    if (!input)
    {
      throw ('Delete failed.  No input was provided');
    }

    console.log('DELETE | 0', input);
    const roiAggregateOrError: Result<boolean> = await this.repo.deleteRoiAggregate(input);


    console.log('DELETE | 1', roiAggregateOrError);

    // SUCCESS
    if (roiAggregateOrError.isSuccess)
    {
      return roiAggregateOrError.getValue();
    }

    // FAILURE
    throw roiAggregateOrError.getError();
  }

}

export const deleteRoiAggregateUseCase: DeleteRoiAggregateUseCase = DeleteRoiAggregateUseCase.create(roiAggregateRepoService);
