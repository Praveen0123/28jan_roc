import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SpinnerEffects } from './effects';
import { reducer } from './reducer';
import { SPINNER_STORE_FEATURE_KEY } from './state';


@NgModule({
  imports:
    [
      CommonModule,
      StoreModule.forFeature(SPINNER_STORE_FEATURE_KEY, reducer),
      EffectsModule.forFeature([SpinnerEffects])
    ],
  declarations:
    [

    ]
})
export class SpinnerStoreModule { }
