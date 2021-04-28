import { createAction } from '@ngrx/store';


export const showSpinner = createAction
  (
    '[Spinner] show spinner'
  );

export const hideSpinner = createAction
  (
    '[Spinner] hide spinner'
  );
