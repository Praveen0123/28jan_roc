export const SPINNER_STORE_FEATURE_KEY = 'spinner';

export interface SpinnerState
{
  spinnerCounter: number;
}

export const initialSpinnerState: SpinnerState =
{
  spinnerCounter: 0
};
