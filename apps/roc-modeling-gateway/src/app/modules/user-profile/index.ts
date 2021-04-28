import 'graphql-import-node';

import { GraphQLModule } from '@graphql-modules/core';

import UserProfileProvider from './providers/providers';
import resolvers from './resolvers/resolvers';
import * as typeDefs from './schema/schema.graphql';
import { SaveUserProfileUseCase, saveUserProfileUseCase } from './use-cases/save-user-profile';
import { UserProfileByIdUseCase, userProfileByIdUseCase } from './use-cases/user-profile-by-id';
import { UserProfileByIdOrDefaultUseCase, userProfileByIdOrDefaultUseCase } from './use-cases/user-profile-by-id-or-default';

export const UserProfileModule = new GraphQLModule
  (
    {
      name: 'UserProfiles',
      typeDefs,
      resolvers,
      providers:
        [
          UserProfileProvider,
          {
            provide: UserProfileByIdUseCase,
            useFactory: () => userProfileByIdUseCase
          },
          {
            provide: UserProfileByIdOrDefaultUseCase,
            useFactory: () => userProfileByIdOrDefaultUseCase
          },
          {
            provide: SaveUserProfileUseCase,
            useFactory: () => saveUserProfileUseCase
          }
        ]
    }
  );
