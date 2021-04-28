import { UserProfileInput } from '@roc-modeling-gateway-models';

export interface UserByIdWithDefault
{
  userId: string;
  defaultUserProfile: UserProfileInput;
}
