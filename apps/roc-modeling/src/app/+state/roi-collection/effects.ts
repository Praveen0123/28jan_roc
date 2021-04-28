import { Injectable } from '@angular/core';
import { CONFIG } from '@app/config/config';
import { CareerGoalForm, CurrentInformationForm, EducationCostForm } from '@app/core/models';
import { NavigationService } from '@app/core/services';
import { NotificationService } from '@app/core/services/notification/notification.service';
import { ActiveRoiDto, CareerGoalDto, CurrentInformationDto, EducationCostDto, RoiModelService, RoiModelToSaveDto } from '@app/domain';
import {
  DeleteRoiAggregateGQL,
  ExchangeAutoCompleteForLocationGQL,
  ExchangeAutoCompleteForOccupationGQL,
  GetRoiAggregateGQL,
  GetRoiAggregateListAllGQL,
  GetRoiAggregateListBySearchTermGQL,
  GetRoiAggregateListMostRecentGQL,
  GetRoiAggregateListSharedFromGQL,
  GetRoiAggregateListSharedWithGQL,
  GetRoiAggregateMostRecentGQL,
  InstitutionByUnitIdGQL,
  InstructionalProgramGQL,
  RoiAggregateInput,
  RoiAggregateModel,
  SaveRoiAggregateGQL,
  ShareAggregateGQL,
  ShareInput,
  Tenant,
  UserProfile,
  UserType,
} from '@gql';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AutoCompleteModel } from '@vantage-point/auto-complete-textbox';
import { UseCaseError } from '@vantage-point/ddd-core';
import { forkJoin, of } from 'rxjs';
import { catchError, concatMap, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { determineActiveAccordionPanel } from '../accordion/actions';
import { selectTenant } from '../tenant/selectors';
import { getUserProfile } from '../user/selectors';
import {
  clearActiveRoiAggregate,
  clearInProgressShareModel,
  cloneRoiModel,
  collectionReceivedFromDatastore,
  createNewAggregate,
  createNewRoiModel,
  deleteRoiModel,
  processCareerGoalForm,
  processCurrentInformationForm,
  processEducationCostForm,
  processEducationFinancingForm,
  renameAggregate,
  renameModel,
  requestActiveModels,
  requestCollectionAllFromDatastore,
  requestCollectionBySearchTermFromDatastore,
  requestCollectionMostRecentFromDatastore,
  requestCollectionSharedFromFromDatastore,
  requestCollectionSharedWithFromDatastore,
  requestDeleteRoiAggregate,
  requestMakeRoiModelActive,
  requestMostRecentAggregate,
  requestRoiAggregateFromSearchPage,
  requestShareRoiAggregate,
  resetAggregate,
  roiAggregateFromSearchPageReceived,
  roiCollectionErrorHappened,
  saveRoiAggregateToDataStore,
  setActiveModelHash,
  setActiveModels,
  setActiveRoiAggregate,
  setActiveShareHistory,
  setCollectionFilterType,
  setInProgressShareModel,
  shareRoiAggregate,
  successfullyDeletedRoiAggregate,
  successfullyShareRoiAggregate,
} from './actions';
import { getActiveRoiAggregateId, getActiveRoiModelDto, getActiveRoiModelHash } from './selectors';
import { CollectionFilterEnum, ShareRoiAggregateModel } from './state';


@Injectable()
export class RoiModelStoreEffects
{

  constructor
    (
      private store: Store,
      private actions$: Actions,
      private exchangeAutoCompleteForLocationGQL: ExchangeAutoCompleteForLocationGQL,
      private exchangeAutoCompleteForOccupationGQL: ExchangeAutoCompleteForOccupationGQL,
      private instructionalProgramGQL: InstructionalProgramGQL,
      private institutionByUnitIdGQL: InstitutionByUnitIdGQL,
      private getRoiAggregateGQL: GetRoiAggregateGQL,
      private getRoiAggregateMostRecentGQL: GetRoiAggregateMostRecentGQL,
      private getRoiAggregateListAllGQL: GetRoiAggregateListAllGQL,
      private getRoiAggregateListBySearchTermGQL: GetRoiAggregateListBySearchTermGQL,
      private getRoiAggregateListMostRecentGQL: GetRoiAggregateListMostRecentGQL,
      private getRoiAggregateListSharedFromGQL: GetRoiAggregateListSharedFromGQL,
      private getRoiAggregateListSharedWithGQL: GetRoiAggregateListSharedWithGQL,
      private deleteRoiAggregateGQL: DeleteRoiAggregateGQL,
      private saveRoiAggregateGQL: SaveRoiAggregateGQL,
      private shareAggregateGQL: ShareAggregateGQL,
      private roiModelService: RoiModelService,
      private navigationService: NavigationService,
      private notificationService: NotificationService
    )
  {
  }




  /* #region  COLLECTION ACTIONS */

  requestCollectionAllFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionAllFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListAllGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }, { fetchPolicy: "network-only" }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListAll }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.ALL })
              ])
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Collection List | ALL') })))
    ));

  requestCollectionBySearchTermFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionBySearchTermFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([action, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListBySearchTermGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id,
              searchTerm: action.searchTerm
            }, { fetchPolicy: "network-only" }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListBySearchTerm }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.BY_SEARCH_TERM })
              ])
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Collection List | SEARCH TERM') })))
    ));

  requestCollectionMostRecentFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionMostRecentFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListMostRecentGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }, { fetchPolicy: "network-only" }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListMostRecent }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.MOST_RECENT })
              ])
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Collection List | MOST RECENT') })))
    ));

  requestCollectionSharedFromFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionSharedFromFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListSharedFromGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }, { fetchPolicy: "network-only" }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListSharedFrom }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.SHARED_FROM })
              ])
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Collection List | SHARED FROM') })))
    ));

  requestCollectionSharedWithFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionSharedWithFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListSharedWithGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }, { fetchPolicy: "network-only" }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListSharedWith }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.SHARED_WITH })
              ])
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Collection List | SHARED WITH') })))
    ));


  requestDeleteRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestDeleteRoiAggregate),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(getActiveRoiAggregateId))
            )
        )),
      switchMap(([action, activeRoiAggregateId]) =>
      {
        return this.deleteRoiAggregateGQL
          .mutate({ roiAggregateId: action.id })
          .pipe
          (
            switchMap(() =>
            {
              if (action.id === activeRoiAggregateId)
              {
                return [
                  successfullyDeletedRoiAggregate(),
                  clearActiveRoiAggregate()
                ];
              }

              return [successfullyDeletedRoiAggregate()];
            })
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Delete Collection') })))
    ));
  successfullyDeletedRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(successfullyDeletedRoiAggregate),
      tap(() => this.notificationService.success('Successfully deleted collection').afterDismissed())
    ), { dispatch: false });

  clearActiveRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(clearActiveRoiAggregate),
      map(() => createNewAggregate())
    ));
  /* #endregion */






  /* #region  ROI AGGREGATE ACTIONS */

  requestMostRecentAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestMostRecentAggregate),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(getActiveRoiAggregateId))
            )
        )),
      filter(([_, activeRoiAggregateId]) =>
      {
        if (activeRoiAggregateId)
        {
          return false;
        }

        return true;
      }),
      switchMap(() => this.roiModelService.getDefaultAggregateToSaveModel()),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([defaultRoiModelToSaveDto, tenant, userProfile]) =>
      {
        // console.log('WHO DAT | defaultRoiAggregate', roiModelToSaveDto);
        // console.log('WHO DAT | tenant', tenant);
        // console.log('WHO DAT say they gonna beat them saints? | userProfile', userProfile);

        const defaultRoiAggregate: RoiAggregateInput =
        {
          tenantId: tenant.id,
          userId: userProfile.id,
          roiAggregateId: defaultRoiModelToSaveDto.roiAggregateId,
          roiAggregateName: defaultRoiModelToSaveDto.name,
          roiAggregate: defaultRoiModelToSaveDto
        };

        return this.getRoiAggregateMostRecentGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id,
              defaultRoiAggregate: defaultRoiAggregate
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              // console.log('WHO DAT', results.data.getRoiAggregateMostRecent);

              const roiAggregateModel: RoiAggregateModel = results.data.getRoiAggregateMostRecent;

              return [
                setActiveRoiAggregate({ roiAggregateModel }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.MOST_RECENT }),
                setActiveShareHistory({ history: roiAggregateModel.shareHistory })
              ];
            })
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Most Recent Aggregate') })))
    ));

  setActiveRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(setActiveRoiAggregate),
      concatMap((action) => this.roiModelService.fromSaveModelToAggregate(action.roiAggregateModel.roiAggregate)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Set Active Aggregate') })))
    ));
  requestRoiAggregateFromSearchPage$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestRoiAggregateFromSearchPage),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([action, tenant, userProfile]) =>
      {
        return this.getRoiAggregateGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id,
              roiAggregateId: action.roiAggregateCardModel.roiAggregateId
            }
          )
          .pipe
          (
            switchMap((results) => [
              setActiveRoiAggregate({ roiAggregateModel: results.data.getRoiAggregate }),
              roiAggregateFromSearchPageReceived()
            ])
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Request Aggregate from Search Page') })))
    ));
  roiAggregateFromSearchPageReceived$ = createEffect(() => this.actions$.pipe
    (
      ofType(roiAggregateFromSearchPageReceived),
      tap(() => this.navigationService.goToModelingPage())
    ), { dispatch: false });


  saveRoiAggregateToDataStore$ = createEffect(() => this.actions$.pipe
    (
      ofType(saveRoiAggregateToDataStore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      concatMap(([action, tenant, userProfile]) =>
      {
        return forkJoin
          (
            [
              of(action),
              of(tenant),
              of(userProfile),
              this.roiModelService.fromAggregateToSaveModel()
            ]
          );
      }),
      switchMap((results) =>
      {
        const action = results[0];
        const tenant: Tenant = results[1];
        const userProfile: UserProfile = results[2];
        const roiModelToSaveDto: RoiModelToSaveDto = results[3];

        const roiAggregateInput: RoiAggregateInput =
        {
          tenantId: tenant.id,
          userId: userProfile.id,
          roiAggregateId: roiModelToSaveDto.roiAggregateId,
          roiAggregateName: roiModelToSaveDto.name,
          roiAggregate: roiModelToSaveDto
        };

        // console.log('TO BE SAVED:', roiAggregateInput);

        return this.saveRoiAggregateGQL
          .mutate({ roiAggregateInput }, CONFIG.API.SILENT_REQUEST)
          .pipe
          (
            map(() => setActiveModelHash({ hash: action.hash }))
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'SAVE ROI AGGREGATE') })))
    ));


  renameAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(renameAggregate),
      concatMap((action) => this.roiModelService.renameAggregate(action.name)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RENAME ROI AGGREGATE') })))
    ));



  requestShareRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestShareRoiAggregate),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      map(([action, tenant, userProfile]) =>
      {
        const inProgressShareModel: ShareRoiAggregateModel =
        {
          tenantId: tenant.id,
          tenantHostName: tenant.hostName,
          sharedFromUserId: userProfile.id,
          sharedFromUserName: userProfile.fullName,
          roiAggregateId: action.roiAggregateId,
          firstName: null,
          lastName: null,
          emailAddress: null,
          note: null
        };

        return setInProgressShareModel({ inProgressShareModel });
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'Request Share Aggregate') })))
    ));
  setInProgressShareModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(setInProgressShareModel),
      tap(() => this.navigationService.goToShareModelPage())
    ), { dispatch: false });
  shareRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(shareRoiAggregate),

      // BUILD SHARE MODEL AND SEND TO BACKEND & SHOW SUCCESS MESSAGE
      switchMap((action) =>
      {
        const shareInput: ShareInput =
        {
          tenantId: action.shareRoiAggregateModel.tenantId,
          tenantHostName: action.shareRoiAggregateModel.tenantHostName,
          roiAggregateId: action.shareRoiAggregateModel.roiAggregateId,
          sharedFromUserId: action.shareRoiAggregateModel.sharedFromUserId,
          sharedFromUserName: action.shareRoiAggregateModel.sharedFromUserName,
          firstName: action.shareRoiAggregateModel.firstName,
          lastName: action.shareRoiAggregateModel.lastName,
          emailAddress: action.shareRoiAggregateModel.emailAddress,
          userType: UserType.Student
        };

        return this.shareAggregateGQL
          .mutate({ shareInput })
          .pipe
          (
            switchMap(() => this.notificationService.success('successfully shared model').afterDismissed())
          );
      }),

      // FINALLY, NAVIGATE USER BACK TO MODEL PAGE...
      switchMap(() => [
        successfullyShareRoiAggregate(),
        clearInProgressShareModel()
      ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'SHARE ROI AGGREGATE') })))
    ));
  successfullyShareRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(successfullyShareRoiAggregate),
      tap(() => this.navigationService.goToModelingPage())
    ), { dispatch: false });


  resetAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(resetAggregate),
      concatMap(() => this.roiModelService.resetAggregate()),
      switchMap(() =>
      {
        return [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ];
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RESET ROI AGGREGATE') })))
    ));
  createNewAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(createNewAggregate),
      concatMap(() => this.roiModelService.createNewAggregate()),
      switchMap(() =>
      {
        return [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ];
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CREATE NEW ROI AGGREGATE') })))
    ));

  /* #endregion */






  /* #region  ROI MODEL ACTIONS */

  requestActiveModels$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestActiveModels),
      concatMap(() => this.roiModelService.getActiveRoiModel()),
      map((activeRoiDto: ActiveRoiDto) => setActiveModels({ activeRoiDto: activeRoiDto })),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CREATE NEW ROI MODEL') })))
    ));

  setActiveModels$ = createEffect(() => this.actions$.pipe
    (
      ofType(setActiveModels),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(getActiveRoiModelHash))
            )
        )),
      map(([action, existingModelHash]) =>
      {
        const shouldSaveBeExecuted: boolean = (!existingModelHash) ? false : (action.activeRoiDto.roiModelDto.modelHash !== existingModelHash);
        // console.log('incoming model hash:', action.activeRoiDto.roiModelDto.modelHash);
        // console.log('existing model hash:', existingModelHash);
        // console.log('should Save Be Executed:', shouldSaveBeExecuted);

        if (shouldSaveBeExecuted)
        {
          return saveRoiAggregateToDataStore({ hash: action.activeRoiDto.roiModelDto.modelHash });
        }

        return setActiveModelHash({ hash: action.activeRoiDto.roiModelDto.modelHash });
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RENAME ROI AGGREGATE') })))
    ));




  createNewRoiModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(createNewRoiModel),
      concatMap(() => this.roiModelService.createEmptyRoiModel(null)),
      switchMap(() =>
        [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CREATE NEW ROI MODEL') })))
    ));
  renameModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(renameModel),
      concatMap((action) => this.roiModelService.renameModel(action.name)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RENAME ROI MODEL') })))
    ));
  cloneRoiModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(cloneRoiModel),
      concatMap((action) => this.roiModelService.cloneRoiModel(action.dialogDataToKeepModel)),
      concatMap(() =>
        [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CLONE ROI MODEL') })))
    ));
  requestMakeRoiModelActive$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestMakeRoiModelActive),
      concatMap((action) => this.roiModelService.makeActive(action.roiModelDto)),
      switchMap(() =>
      {
        return [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ];
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'MAKE ROI MODEL ACTIVE') })))
    ));
  deleteRoiModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(deleteRoiModel),
      concatMap((action) => this.roiModelService.deleteRoiModel(action.roiModelDto)),
      switchMap(() =>
        [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'DELETE ROI MODEL') })))
    ));



  processCurrentInformationForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processCurrentInformationForm),
      switchMap((action) =>
      {
        const formData: CurrentInformationForm = action.currentInformationForm;
        const location: AutoCompleteModel = formData?.currentLocation;
        const occupation: AutoCompleteModel = formData?.currentOccupation;

        // console.log('EFFECTS | PROCESS CURRENT INFORMATION', formData);

        /*
        RETRIEVE LOCATION AND OCCUPATION FROM BACKEND....
        */
        return forkJoin
          (
            {
              location: (location) ? this.exchangeAutoCompleteForLocationGQL.fetch({ autoCompleteModel: location }, CONFIG.API.SILENT_REQUEST) : of(null),
              occupation: (occupation) ? this.exchangeAutoCompleteForOccupationGQL.fetch({ autoCompleteModel: occupation }, CONFIG.API.SILENT_REQUEST) : of(null)
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              // console.log('EFFECTS | RESULTS:', results);

              const currentInformation: CurrentInformationDto =
              {
                currentAge: formData.currentAge,
                occupation: (results.occupation) ? results.occupation.data.exchangeAutoCompleteForOccupation : null,
                location: (results.location) ? results.location.data.exchangeAutoCompleteForLocation : null,
                educationLevel: formData.educationLevel
              };

              return this.roiModelService.updateCurrentInformation(currentInformation);
            })
          );
      }),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS CURRENT INFORMATION FORM') })))
    ));
  processCareerGoalForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processCareerGoalForm),
      withLatestFrom(this.store.pipe(select(getActiveRoiModelDto))),
      switchMap(([action, activeRoiModel]) =>
      {
        const formData: CareerGoalForm = action.careerGoalForm;
        const location: AutoCompleteModel = formData?.location;
        const occupation: AutoCompleteModel = formData?.occupation;
        const cipCode: string = formData?.degreeProgram?.id;

        // console.log('EFFECTS | CAREER GOAL FORM DATA', formData);
        // console.log('EFFECTS | ACTIVE ROI MODEL', activeRoiModel);

        const hasLocationChanged: boolean = (formData.location?.id !== activeRoiModel.location?.zipCode);
        const hasOccupationChanged: boolean = (formData.occupation?.id !== activeRoiModel.occupation?.onetCode);
        const hasProgramChanged: boolean = (formData.degreeProgram?.id !== activeRoiModel.degreeProgram?.cipCode);

        // console.log('EFFECTS | hasLocationChanged', hasLocationChanged);
        // console.log('EFFECTS | hasOccupationChanged', hasOccupationChanged);
        // console.log('EFFECTS | hasProgramChanged', hasProgramChanged);

        /*
        RETRIEVE LOCATION AND OCCUPATION FROM BACKEND....
        */
        return forkJoin
          (
            {
              location: (location && hasLocationChanged) ? this.exchangeAutoCompleteForLocationGQL.fetch({ autoCompleteModel: location }, CONFIG.API.SILENT_REQUEST) : of(null),
              occupation: (occupation && hasOccupationChanged) ? this.exchangeAutoCompleteForOccupationGQL.fetch({ autoCompleteModel: occupation }) : of(null),
              program: (cipCode && hasProgramChanged) ? this.instructionalProgramGQL.fetch({ cipCode: cipCode }) : of(null)
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              // console.log('RESULTS', results);

              const careerGoal: CareerGoalDto =
              {
                location: (results.location) ? results.location.data.exchangeAutoCompleteForLocation : (!hasLocationChanged) ? activeRoiModel.location : null,
                occupation: (results.occupation) ? results.occupation.data.exchangeAutoCompleteForOccupation : (!hasOccupationChanged) ? activeRoiModel.occupation : null,
                degreeLevel: formData.degreeLevel,
                degreeProgram: (results.program) ? results.program.data.instructionalProgram : (!hasProgramChanged) ? activeRoiModel.degreeProgram : null,
                retirementAge: formData.retirementAge,
                careerGoalPathType: formData.careerGoalPathType
              };

              return this.roiModelService.updateCareerGoal(careerGoal);
            })
          );
      }),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS CAREER GOAL FORM') })))
    ));
  processEducationCostForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processEducationCostForm),
      switchMap((action) =>
      {
        const formData: EducationCostForm = action.educationCostForm;
        const institutionId: string = formData?.institution?.id;

        /*
        RETRIEVE INSTITUTION FROM BACKEND....
        */
        return forkJoin
          (
            {
              institution: (institutionId) ? this.institutionByUnitIdGQL.fetch({ unitId: institutionId }, CONFIG.API.SILENT_REQUEST) : of(null),
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              const educationCost: EducationCostDto =
              {
                institution: (results.institution) ? results.institution.data.institution : null,
                startYear: formData.startYear,
                incomeRange: formData.incomeRange,
                isFulltime: formData.isFulltime,
                yearsToCompleteDegree: formData.yearsToCompleteDegree
              };

              return this.roiModelService.updateEducationCost(educationCost);
            })
          );
      }),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS EDUCATION COST FORM') })))
    ));
  processEducationFinancingForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processEducationFinancingForm),
      switchMap((action) => this.roiModelService.updateEducationFinancing(action.educationFinancingForm)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS EDUCATION FINANCING FORM') })))
    ));

  /* #endregion */





  roiCollectionErrorHappened$ = createEffect(() => this.actions$.pipe
    (
      ofType(roiCollectionErrorHappened),
      map((action) => this.notificationService.error(action.useCaseError).afterDismissed())
    ), { dispatch: false });



  private createUseCaseError(message: string, errorType: string): UseCaseError
  {
    const useCaseError: UseCaseError =
    {
      message: message,
      error: null,
      errorType: errorType,
      details: null
    };

    return useCaseError;
  }

}
