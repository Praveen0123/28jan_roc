import { RoiAggregateInput } from '@roc-modeling-gateway-models';

export interface RoiAggregateParameters
{
  tenantId: string;
  userId: string;
  roiAggregateId?: string;
}

export interface RoiAggregateParametersWithDefault
{
  tenantId: string;
  userId: string;
  defaultRoiAggregate: RoiAggregateInput;
}

export interface RoiAggregateSearchParameters
{
  tenantId: string;
  userId: string;
  searchTerm: string;
}
