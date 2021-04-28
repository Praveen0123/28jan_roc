import 'graphql-import-node';

import { GraphQLModule } from '@graphql-modules/core';

import RoiAggregateProvider from './providers/providers';
import resolvers from './resolvers/resolvers';
import * as typeDefs from './schema/schema.graphql';
import { DeleteRoiAggregateUseCase, deleteRoiAggregateUseCase } from './use-cases/delete-roi-aggregate';
import { GetRoiAggregateUseCase, getRoiAggregateUseCase } from './use-cases/get-roi-aggregate';
import { GetRoiAggregateListAllUseCase, getRoiAggregateListAllUseCase } from './use-cases/get-roi-aggregate-list-all';
import { GetRoiAggregateListBySearchTermUseCase, getRoiAggregateListBySearchTermUseCase } from './use-cases/get-roi-aggregate-list-by-search-term';
import { GetRoiAggregateListMostRecentUseCase, getRoiAggregateListMostRecentUseCase } from './use-cases/get-roi-aggregate-list-most-recent';
import { GetRoiAggregateListSharedFromUseCase, getRoiAggregateListSharedFromUseCase } from './use-cases/get-roi-aggregate-list-shared-from';
import { GetRoiAggregateListSharedWithUseCase, getRoiAggregateListSharedWithUseCase } from './use-cases/get-roi-aggregate-list-shared-with';
import { GetRoiAggregateMostRecentUseCase, getRoiAggregateMostRecentUseCase } from './use-cases/get-roi-aggregate-most-recent';
import { SaveRoiAggregateUseCase, saveRoiAggregateUseCase } from './use-cases/save-roi-aggregate';
import { ShareUseCase, shareUseCase } from './use-cases/share';

export const RoiAggregateModule = new GraphQLModule
  (
    {
      name: 'RoiAggregate',
      typeDefs,
      resolvers,
      providers:
        [
          RoiAggregateProvider,

          {
            provide: DeleteRoiAggregateUseCase,
            useFactory: () => deleteRoiAggregateUseCase
          },
          {
            provide: GetRoiAggregateUseCase,
            useFactory: () => getRoiAggregateUseCase
          },
          {
            provide: GetRoiAggregateMostRecentUseCase,
            useFactory: () => getRoiAggregateMostRecentUseCase
          },
          {
            provide: GetRoiAggregateListAllUseCase,
            useFactory: () => getRoiAggregateListAllUseCase
          },
          {
            provide: GetRoiAggregateListBySearchTermUseCase,
            useFactory: () => getRoiAggregateListBySearchTermUseCase
          },
          {
            provide: GetRoiAggregateListMostRecentUseCase,
            useFactory: () => getRoiAggregateListMostRecentUseCase
          },
          {
            provide: GetRoiAggregateListSharedFromUseCase,
            useFactory: () => getRoiAggregateListSharedFromUseCase
          },
          {
            provide: GetRoiAggregateListSharedWithUseCase,
            useFactory: () => getRoiAggregateListSharedWithUseCase
          },
          {
            provide: SaveRoiAggregateUseCase,
            useFactory: () => saveRoiAggregateUseCase
          },
          {
            provide: ShareUseCase,
            useFactory: () => shareUseCase
          }
        ]
    }
  );
