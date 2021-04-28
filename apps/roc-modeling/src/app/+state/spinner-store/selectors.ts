import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { SPINNER_STORE_FEATURE_KEY, SpinnerState } from './state';


export const spinnerSlice = createFeatureSelector<SpinnerState>
  (
    SPINNER_STORE_FEATURE_KEY
  );

export const getSpinnerCount: MemoizedSelector<object, number> = createSelector
  (
    spinnerSlice,
    (state: SpinnerState): number => state.spinnerCounter
  );

export const getIsSpinnerActive: MemoizedSelector<object, boolean> = createSelector
  (
    spinnerSlice,
    (state: SpinnerState): boolean => (state.spinnerCounter !== 0)
  );
