import { createReducer, on } from '@ngrx/store';

import { hideSpinner, showSpinner } from './actions';
import { initialSpinnerState } from './state';


export const reducer = createReducer
  (
    initialSpinnerState,

    on(showSpinner, state =>
    {
      const newSpinnerCount = state.spinnerCounter + 1;

      return { state, spinnerCounter: newSpinnerCount };
    }),

    on(hideSpinner, state =>
    {
      const newSpinnerCount = (state.spinnerCounter > 0) ? state.spinnerCounter - 1 : 0;

      return { state, spinnerCounter: newSpinnerCount };
    })
  );
