import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { requestRoiAggregateFromSearchPage } from '../roi-collection/actions';
import { addToCompare, clearAll, loadCompareModel, setCompareRoiAggregateId } from './actions';
import { CompareService } from './compare.service';
import { CompareModel } from './state';



@Injectable()
export class CompareStoreEffects
{
  constructor
    (
      private store: Store,
      private actions$: Actions,
      private compareService: CompareService
    ) { }

  addToCompare$ = createEffect(() => this.actions$.pipe
    (
      ofType(addToCompare),
      switchMap((action) =>
      {
        const compareRoiAggregateId: string = action.roiModelDto.roiAggregateId;
        const compareModel: CompareModel = this.compareService.toCompareModel(action.roiModelDto);

        return [
          setCompareRoiAggregateId({ compareRoiAggregateId: compareRoiAggregateId }),
          loadCompareModel({ compareModel })
        ];
      })
    ));

  requestRoiAggregateFromSearchPage$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestRoiAggregateFromSearchPage),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(setCompareRoiAggregateId))
            )
        )),
      filter(([action, compareRoiAggregateId]) =>
      {
        if (action.roiAggregateCardModel.roiAggregateId.toString() === compareRoiAggregateId.compareRoiAggregateId)
        {
          return false;
        }

        return true;
      }),
      map(() => clearAll())
    ));

}
