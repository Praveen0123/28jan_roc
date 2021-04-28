import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { hideSpinner, showSpinner } from './actions';
import { getIsSpinnerActive, getSpinnerCount } from './selectors';


@Injectable({
  providedIn: 'root'
})
export class SpinnerFacadeService
{

  constructor
    (
      private store: Store
    ) { }


  showSpinner()
  {
    return this.store.dispatch(showSpinner());
  }

  hideSpinner()
  {
    return this.store.dispatch(hideSpinner());
  }

  getSpinnerCount$(): Observable<number>
  {
    return this.store.pipe(select(getSpinnerCount));
  }

  isSpinnerActive$(): Observable<boolean>
  {
    return this.store.pipe(select(getIsSpinnerActive));
  }

}
