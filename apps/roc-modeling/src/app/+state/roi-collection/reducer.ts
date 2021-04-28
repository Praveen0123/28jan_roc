import { createReducer, on } from '@ngrx/store';

import {
  clearActiveRoiAggregate,
  clearInProgressShareModel,
  collectionReceivedFromDatastore,
  requestCollectionAllFromDatastore,
  requestCollectionBySearchTermFromDatastore,
  requestCollectionMostRecentFromDatastore,
  requestCollectionSharedFromFromDatastore,
  requestCollectionSharedWithFromDatastore,
  requestDeleteRoiAggregate,
  setActiveModelHash,
  setActiveModels,
  setActiveRoiAggregate,
  setActiveShareHistory,
  setCollectionFilterType,
  setInProgressShareModel,
} from './actions';
import { initialRoiCollectionState, roiCollectionAdapter } from './state';


export const reducer = createReducer
  (
    initialRoiCollectionState,

    on(
      requestCollectionAllFromDatastore,
      requestCollectionBySearchTermFromDatastore,
      requestCollectionMostRecentFromDatastore,
      requestCollectionSharedFromFromDatastore,
      requestCollectionSharedWithFromDatastore,
      (state) =>
      {
        return roiCollectionAdapter.removeAll({ ...state });
      }),

    on(requestDeleteRoiAggregate, (state, { id }) => roiCollectionAdapter.removeOne(id, { ...state })),

    on(collectionReceivedFromDatastore, (state, { list }) => roiCollectionAdapter.addMany(list ?? [], { ...state })),

    on(setActiveRoiAggregate, (state, { roiAggregateModel }) => (
      {
        ...state,
        activeRoiAggregateId: roiAggregateModel.roiAggregateId,
        activeRoiModelDto: null,
        activeRoiModelHash: null,
        activeUserModelDto: null
      })),

    on(clearActiveRoiAggregate, (state) => (
      {
        ...state,
        activeRoiAggregateId: null,
        activeRoiModelDto: null,
        activeRoiModelHash: null,
        activeUserModelDto: null
      })),

    on(setActiveModels, (state, { activeRoiDto }) => (
      {
        ...state,
        activeRoiAggregateId: activeRoiDto.roiModelDto.roiAggregateId,
        activeRoiModelDto: activeRoiDto.roiModelDto,
        activeUserModelDto: activeRoiDto.userModelDto
      })),

    on(setActiveModelHash, (state, { hash }) => (
      {
        ...state,
        activeRoiModelHash: hash
      })),

    on(setActiveShareHistory, (state, { history }) => (
      {
        ...state,
        activeShareHistory: history
      })),

    on(setInProgressShareModel, (state, { inProgressShareModel }) => (
      {
        ...state,
        inProgressShareModel: inProgressShareModel
      })),
    on(clearInProgressShareModel, (state) => (
      {
        ...state,
        inProgressShareModel: null
      })),

    on(setCollectionFilterType, (state, { collectionFilterEnum }) => ({ ...state, collectionFilterType: collectionFilterEnum }))

  );
