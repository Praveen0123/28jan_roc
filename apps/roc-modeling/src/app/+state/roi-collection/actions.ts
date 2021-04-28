import { CareerGoalForm, CurrentInformationForm, EducationCostForm } from '@app/core/models';
import { ActiveRoiDto, DialogDataToKeepModel, EducationFinancingDto, RoiModelDto } from '@app/domain';
import { RoiAggregateCardModel, RoiAggregateModel, SharedHistoryModel } from '@gql';
import { createAction, props } from '@ngrx/store';
import { UseCaseError } from '@vantage-point/ddd-core';

import { CollectionFilterEnum, ShareRoiAggregateModel } from './state';


/* #region  COLLECTION ACTIONS */

export const requestMostRecentAggregate = createAction
  (
    '[RoiCollection] request most recent aggregate'
  );


export const requestCollectionAllFromDatastore = createAction
  (
    '[RoiCollection] request all collection from datastore'
  );
export const requestCollectionBySearchTermFromDatastore = createAction
  (
    '[RoiCollection] request collection by search term from datastore',
    props<{ searchTerm: string; }>()
  );
export const requestCollectionMostRecentFromDatastore = createAction
  (
    '[RoiCollection] request most recent collection from datastore'
  );
export const requestCollectionSharedFromFromDatastore = createAction
  (
    '[RoiCollection] request shared from collection from datastore'
  );
export const requestCollectionSharedWithFromDatastore = createAction
  (
    '[RoiCollection] request shared with collection from datastore'
  );


export const setCollectionFilterType = createAction
  (
    '[RoiCollection] set collection filer type',
    props<{ collectionFilterEnum: CollectionFilterEnum; }>()
  );

export const collectionReceivedFromDatastore = createAction
  (
    '[RoiCollection] collection received from datastore',
    props<{ list: RoiAggregateCardModel[]; }>()
  );

export const requestDeleteRoiAggregate = createAction
  (
    '[RoiCollection] request delete collection',
    props<{ id: string; }>()
  );
export const successfullyDeletedRoiAggregate = createAction
  (
    '[RoiCollection] successfully deleted collection'
  );
export const clearActiveRoiAggregate = createAction
  (
    '[RoiCollection] clear active Roi Aggregate'
  );



/* #endregion */





/* #region  ROI AGGREGATE ACTIONS */

export const setActiveRoiAggregate = createAction
  (
    '[RoiCollection] set active RoiAggregateModel',
    props<{ roiAggregateModel: RoiAggregateModel; }>()
  );
export const requestRoiAggregateFromSearchPage = createAction
  (
    '[RoiCollection] request RoiAggregate from search page',
    props<{ roiAggregateCardModel: RoiAggregateCardModel; }>()
  );

export const roiAggregateFromSearchPageReceived = createAction
  (
    '[RoiCollection] roiAggregate from search page received'
  );


export const requestActiveModels = createAction
  (
    '[RoiCollection] request active models'
  );
export const setActiveModels = createAction
  (
    '[RoiCollection] set active models',
    props<{ activeRoiDto: ActiveRoiDto; }>()
  );
export const setActiveModelHash = createAction
  (
    '[RoiCollection] set active model hash',
    props<{ hash: string; }>()
  );
export const setActiveShareHistory = createAction
  (
    '[RoiCollection] set active share history',
    props<{ history: SharedHistoryModel[]; }>()
  );


export const saveRoiAggregateToDataStore = createAction
  (
    '[RoiCollection] save Roi Aggregate to Data Store',
    props<{ hash: string; }>()
  );
export const renameAggregate = createAction
  (
    '[RoiModel] rename aggregate',
    props<{ name: string; }>()
  );
export const requestShareRoiAggregate = createAction
  (
    '[RoiModel] request share roi aggregate',
    props<{ roiAggregateId: string; }>()
  );
export const setInProgressShareModel = createAction
  (
    '[RoiModel] set in progress share model',
    props<{ inProgressShareModel: ShareRoiAggregateModel; }>()
  );
export const clearInProgressShareModel = createAction
  (
    '[RoiModel] clear in progress share model'
  );

export const shareRoiAggregate = createAction
  (
    '[RoiModel] share roi aggregate',
    props<{ shareRoiAggregateModel: ShareRoiAggregateModel; }>()
  );
export const successfullyShareRoiAggregate = createAction
  (
    '[RoiModel] successfully shared roi aggregate'
  );
export const resetAggregate = createAction
  (
    '[RoiModel] reset aggregate'
  );
export const createNewAggregate = createAction
  (
    '[RoiModel] create new aggregate'
  );

/* #endregion */





/* #region  ROI MODEL ACTIONS */

export const createNewRoiModel = createAction
  (
    '[RoiModel] create new roiModel'
  );
export const renameModel = createAction
  (
    '[RoiModel] rename model',
    props<{ name: string; }>()
  );
export const cloneRoiModel = createAction
  (
    '[RoiModel] clone roi model',
    props<{ dialogDataToKeepModel: DialogDataToKeepModel; }>()
  );
export const requestMakeRoiModelActive = createAction
  (
    '[RoiModel] request make roi model active',
    props<{ roiModelDto: RoiModelDto; }>()
  );
export const deleteRoiModel = createAction
  (
    '[RoiModel] remove roi model',
    props<{ roiModelDto: RoiModelDto; }>()
  );


export const processCurrentInformationForm = createAction
  (
    '[RoiModel] process current information form',
    props<{ currentInformationForm: CurrentInformationForm; }>()
  );
export const processCareerGoalForm = createAction
  (
    '[RoiModel] process career goal form',
    props<{ careerGoalForm: CareerGoalForm; }>()
  );
export const processEducationCostForm = createAction
  (
    '[RoiModel] process education cost form',
    props<{ educationCostForm: EducationCostForm; }>()
  );
export const processEducationFinancingForm = createAction
  (
    '[RoiModel] process education financing form',
    props<{ educationFinancingForm: EducationFinancingDto; }>()
  );

/* #endregion */





export const roiCollectionErrorHappened = createAction
  (
    '[RoiCollection] Roi Collection Error',
    props<{ useCaseError: UseCaseError; }>()
  );

export const NoopAction = createAction
  (
    '[RoiCollection] noop action'
  );
