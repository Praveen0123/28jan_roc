import { ModuleContext } from '@graphql-modules/core';
import { RoiAggregateCardModel, RoiAggregateModel } from '@roc-modeling-gateway-models';
import { GraphQLScalarType, Kind } from 'graphql';

import { RoiAggregateParameters, RoiAggregateParametersWithDefault, RoiAggregateSearchParameters } from '../models';
import { DeleteRoiAggregateUseCase } from '../use-cases/delete-roi-aggregate';
import { GetRoiAggregateUseCase } from '../use-cases/get-roi-aggregate';
import { GetRoiAggregateListAllUseCase } from '../use-cases/get-roi-aggregate-list-all';
import { GetRoiAggregateListBySearchTermUseCase } from '../use-cases/get-roi-aggregate-list-by-search-term';
import { GetRoiAggregateListMostRecentUseCase } from '../use-cases/get-roi-aggregate-list-most-recent';
import { GetRoiAggregateListSharedFromUseCase } from '../use-cases/get-roi-aggregate-list-shared-from';
import { GetRoiAggregateListSharedWithUseCase } from '../use-cases/get-roi-aggregate-list-shared-with';
import { GetRoiAggregateMostRecentUseCase } from '../use-cases/get-roi-aggregate-most-recent';
import { SaveRoiAggregateUseCase } from '../use-cases/save-roi-aggregate';
import { ShareUseCase } from '../use-cases/share';


export default
  {
    Query:
    {
      getRoiAggregate: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateModel> =>
      {
        const roiAggregateParameters: RoiAggregateParameters =
        {
          tenantId: args.tenantId,
          userId: args.userId,
          roiAggregateId: args.roiAggregateId
        };

        return await injector.get(GetRoiAggregateUseCase).executeAsync(roiAggregateParameters);
      },
      getRoiAggregateMostRecent: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateModel> =>
      {
        const roiAggregateParametersWithDefault: RoiAggregateParametersWithDefault =
        {
          tenantId: args.tenantId,
          userId: args.userId,
          defaultRoiAggregate: args.defaultRoiAggregate
        };

        return await injector.get(GetRoiAggregateMostRecentUseCase).executeAsync(roiAggregateParametersWithDefault);
      },


      getRoiAggregateListAll: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateCardModel[]> =>
      {
        const roiAggregateParameters: RoiAggregateParameters =
        {
          tenantId: args.tenantId,
          userId: args.userId
        };

        return await injector.get(GetRoiAggregateListAllUseCase).executeAsync(roiAggregateParameters);
      },
      getRoiAggregateListBySearchTerm: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateCardModel[]> =>
      {
        const roiAggregateSearchParameters: RoiAggregateSearchParameters =
        {
          tenantId: args.tenantId,
          userId: args.userId,
          searchTerm: args.searchTerm
        };

        return await injector.get(GetRoiAggregateListBySearchTermUseCase).executeAsync(roiAggregateSearchParameters);
      },
      getRoiAggregateListMostRecent: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateCardModel[]> =>
      {
        const roiAggregateParameters: RoiAggregateParameters =
        {
          tenantId: args.tenantId,
          userId: args.userId
        };

        return await injector.get(GetRoiAggregateListMostRecentUseCase).executeAsync(roiAggregateParameters);
      },
      getRoiAggregateListSharedFrom: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateCardModel[]> =>
      {
        const roiAggregateParameters: RoiAggregateParameters =
        {
          tenantId: args.tenantId,
          userId: args.userId
        };

        return await injector.get(GetRoiAggregateListSharedFromUseCase).executeAsync(roiAggregateParameters);
      },
      getRoiAggregateListSharedWith: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateCardModel[]> =>
      {
        const roiAggregateParameters: RoiAggregateParameters =
        {
          tenantId: args.tenantId,
          userId: args.userId
        };

        return await injector.get(GetRoiAggregateListSharedWithUseCase).executeAsync(roiAggregateParameters);
      }


    },
    Mutation:
    {
      saveRoiAggregate: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateModel> =>
      {
        return await injector.get(SaveRoiAggregateUseCase).executeAsync(args.roiAggregateInput);
      },
      share: async (_root: any, args: any, { injector }: ModuleContext): Promise<RoiAggregateModel> =>
      {
        return await injector.get(ShareUseCase).executeAsync(args.shareInput);
      },
      deleteRoiAggregate: async (_root: any, args: any, { injector }: ModuleContext): Promise<Boolean> =>
      {
        return await injector.get(DeleteRoiAggregateUseCase).executeAsync(args.roiAggregateId);
      }
    },
    Date: new GraphQLScalarType
      (
        {
          name: 'Date',
          description: 'Date custom scalar type',
          parseValue(value)
          {
            return new Date(value); // value from the client
          },
          serialize(value)
          {
            const targetDate: Date = new Date(value);

            return targetDate; // value sent to the client
          },
          parseLiteral(ast)
          {
            if (ast.kind === Kind.INT)
            {
              return new Date(+ast.value); // ast value is always in string format
            }
            if (ast.kind === Kind.STRING)
            {
              const targetDateInput: string | number = ast.value;
              return new Date(targetDateInput);
            }
            return null;
          },
        }
      )
  };
