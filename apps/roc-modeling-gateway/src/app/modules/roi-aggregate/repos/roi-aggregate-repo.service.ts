import { RoiAggregateCardModel, RoiAggregateInput, RoiAggregateModel, ShareInput, UserProfile } from '@roc-modeling-gateway-models';
import { Result } from '@vantage-point/ddd-core';
import { QueryResult } from 'pg';

import { BaseRepository } from '../../../core/base-repository';
import { RoiModelError } from '../errors';
import { RoiModelMapper } from '../mappers';

export class RoiAggregateRepoService extends BaseRepository
{

  private constructor()
  {
    super();
  }

  static create(): RoiAggregateRepoService
  {
    return new RoiAggregateRepoService();
  }


  async deleteRoiAggregate(roiAggregateId: string): Promise<Result<boolean>>
  {
    try
    {
      const queryName: string = 'DeleteAggregate';
      const query = `SELECT "public"."${queryName}"($1)`;
      const params = [roiAggregateId];

      await this.query(query, params);

      return Result.success<boolean>(true);
    }
    catch (error)
    {
      const message = `ERROR - DELETE ROI AGGREGATE | ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<boolean>(roiModelError);
    }
  }


  async getRoiAggregate(tenantId: string, userId: string, roiAggregateId: string): Promise<Result<RoiAggregateModel>>
  {
    try
    {
      const queryName: string = 'GetAggregate';
      const query = `SELECT "public"."${queryName}"($1, $2, $3)`;
      const queryResult: QueryResult<RoiAggregateModel> = await this.query<RoiAggregateModel>(query, [tenantId, userId, roiAggregateId]);
      const roiAggregate: RoiAggregateModel = RoiModelMapper.toRoiModel<RoiAggregateModel>(queryResult, queryName);

      return Result.success<RoiAggregateModel>(roiAggregate);
    }
    catch (error)
    {
      const message = `ERROR | ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateModel>(roiModelError);
    }
  }
  async getRoiAggregateMostRecent(tenantId: string, userId: string, defaultRoiAggregate: RoiAggregateInput): Promise<Result<RoiAggregateModel>>
  {
    try
    {
      const queryName: string = 'GetAggregateMostRecent';
      const query = `SELECT "public"."${queryName}"($1, $2)`;
      const queryResult: QueryResult<RoiAggregateModel> = await this.query<RoiAggregateModel>(query, [tenantId, userId]);
      let roiAggregate: RoiAggregateModel = RoiModelMapper.toRoiModel<RoiAggregateModel>(queryResult, queryName);

      if (roiAggregate)
      {
        return Result.success<RoiAggregateModel>(roiAggregate);
      }

      // IF MOST RECENT ROI AGREGATE DOES NOT EXIST, THEN CREATE A DEFALT ONE
      const defaultRoiAggregateOrError: Result<RoiAggregateModel> = await this.saveRoiAggregate(defaultRoiAggregate);

      if (defaultRoiAggregateOrError.isSuccess)
      {
        return Result.success<RoiAggregateModel>(defaultRoiAggregateOrError.getValue());
      }

      throw defaultRoiAggregateOrError.getError();
    }
    catch (error)
    {
      const message = `ERROR ROI AGGREGATE LIST | MOST RECENT ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateModel>(roiModelError);
    }
  }



  async getRoiAggregateListAll(tenantId: string, userId: string): Promise<Result<RoiAggregateCardModel[]>>
  {
    try
    {
      return this.queryAggregateList('GetAggregateList', tenantId, userId);
    }
    catch (error)
    {
      const message = `ERROR ROI AGGREGATE LIST | MOST RECENT ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateCardModel[]>(roiModelError);
    }
  }
  async getRoiAggregateListBySearchTerm(tenantId: string, userId: string, searchTerm: string): Promise<Result<RoiAggregateCardModel[]>>
  {
    try
    {
      const queryName: string = 'GetAggregateListBySearchTerm';
      const query = `SELECT "public"."${queryName}"($1, $2, $3)`;
      const queryResult: QueryResult<RoiAggregateCardModel[]> = await this.query<RoiAggregateCardModel[]>(query, [tenantId, userId, searchTerm]);
      let roiAggregateList: RoiAggregateCardModel[] = RoiModelMapper.toRoiModel<RoiAggregateCardModel[]>(queryResult, queryName);

      return Result.success<RoiAggregateCardModel[]>(roiAggregateList);
    }
    catch (error)
    {
      const message = `ERROR ROI AGGREGATE LIST | MOST RECENT ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateCardModel[]>(roiModelError);
    }
  }
  async getRoiAggregateListMostRecent(tenantId: string, userId: string): Promise<Result<RoiAggregateCardModel[]>>
  {
    try
    {
      return this.queryAggregateList('GetAggregateListMostRecent', tenantId, userId);
    }
    catch (error)
    {
      const message = `ERROR ROI AGGREGATE LIST | MOST RECENT ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateCardModel[]>(roiModelError);
    }
  }
  async getRoiAggregateListSharedFrom(tenantId: string, userId: string): Promise<Result<RoiAggregateCardModel[]>>
  {
    try
    {
      return this.queryAggregateList('GetAggregateListSharedFrom', tenantId, userId);
    }
    catch (error)
    {
      const message = `ERROR ROI AGGREGATE LIST | MOST RECENT ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateCardModel[]>(roiModelError);
    }
  }
  async getRoiAggregateListSharedWith(tenantId: string, userId: string): Promise<Result<RoiAggregateCardModel[]>>
  {
    try
    {
      return this.queryAggregateList('GetAggregateListSharedWith', tenantId, userId);
    }
    catch (error)
    {
      const message = `ERROR ROI AGGREGATE LIST | MOST RECENT ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateCardModel[]>(roiModelError);
    }
  }



  async saveRoiAggregate(roiAggregateInput: RoiAggregateInput): Promise<Result<RoiAggregateModel>>
  {
    try
    {
      const queryName: string = 'SaveAggregate';
      const query = `SELECT "public"."${queryName}"($1, $2, $3, $4, $5)`;
      const params =
        [
          roiAggregateInput.tenantId,
          roiAggregateInput.userId,
          roiAggregateInput.roiAggregateId,
          roiAggregateInput.roiAggregateName,
          roiAggregateInput.roiAggregate
        ];

      const queryResult: QueryResult<RoiAggregateModel> = await this.query<RoiAggregateModel>(query, params);
      const roiAggregate: RoiAggregateModel = RoiModelMapper.toRoiModel<RoiAggregateModel>(queryResult, queryName);

      return Result.success<RoiAggregateModel>(roiAggregate);
    }
    catch (error)
    {
      const message = `ERROR - SAVE ROI AGGREGATE | ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateModel>(roiModelError);
    }
  }

  async saveShare(shareInput: ShareInput, userProfile: UserProfile): Promise<Result<RoiAggregateModel>>
  {
    try
    {
      const queryName: string = 'SaveShare';
      const query = `SELECT "public"."${queryName}"($1, $2, $3, $4)`;
      const params =
        [
          shareInput.tenantId,
          shareInput.sharedFromUserId,
          userProfile.id,
          shareInput.roiAggregateId
        ];

      const queryResult: QueryResult<RoiAggregateModel> = await this.query<RoiAggregateModel>(query, params);
      const roiAggregate: RoiAggregateModel = RoiModelMapper.toRoiModel<RoiAggregateModel>(queryResult, queryName);

      return Result.success<RoiAggregateModel>(roiAggregate);
    }
    catch (error)
    {
      const message = `ERROR | ${error.message}`;
      const roiModelError: RoiModelError = new RoiModelError(message);

      return Result.failure<RoiAggregateModel>(roiModelError);
    }
  }



  private async queryAggregateList(queryName: string, tenantId: string, userId: string): Promise<Result<RoiAggregateCardModel[]>>
  {
    try
    {
      const query = `SELECT "public"."${queryName}"($1, $2)`;
      const queryResult: QueryResult<RoiAggregateCardModel[]> = await this.query<RoiAggregateCardModel[]>(query, [tenantId, userId]);
      let roiAggregateList: RoiAggregateCardModel[] = RoiModelMapper.toRoiModel<RoiAggregateCardModel[]>(queryResult, queryName);

      return Result.success<RoiAggregateCardModel[]>(roiAggregateList);
    }
    catch (error)
    {
      return Result.failure<RoiAggregateCardModel[]>(error);
    }
  }

}


export const roiAggregateRepoService: RoiAggregateRepoService = RoiAggregateRepoService.create();
