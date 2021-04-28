import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MaterialModule } from '../material/material.module';
import { PipesModule } from '../pipes/pipes.module';
import { ButtonWithIconComponent } from './button-with-icon/button-with-icon.component';
import { CollectionCallToActionComponent } from './collection-call-to-action/collection-call-to-action.component';
import { DialogCloneModelComponent } from './dialog-clone-model/dialog-clone-model.component';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';
import { DialogRenameComponent } from './dialog-rename/dialog-rename.component';
import { NotificationsSnackBarComponent } from './notifications-snack-bar/notifications-snack-bar.component';
import { OwlIconComponent } from './owl-icon/owl-icon.component';
import { SliderComponent } from './slider/slider.component';
import { DialogShareHistoryComponent } from './dialog-share-history/dialog-share-history.component';


@NgModule({
  imports:
    [
      CommonModule,
      ClipboardModule,
      ReactiveFormsModule,
      PipesModule,
      FontAwesomeModule,
      MaterialModule
    ],
  declarations:
    [
      ButtonWithIconComponent,
      CollectionCallToActionComponent,
      DialogCloneModelComponent,
      DialogConfirmationComponent,
      DialogRenameComponent,
      NotificationsSnackBarComponent,
      OwlIconComponent,
      SliderComponent,
      DialogShareHistoryComponent
    ],
  exports:
    [
      ButtonWithIconComponent,
      CollectionCallToActionComponent,
      NotificationsSnackBarComponent,
      OwlIconComponent,
      SliderComponent
    ],
  entryComponents:
    [
      DialogCloneModelComponent,
      DialogConfirmationComponent,
      DialogRenameComponent,
      NotificationsSnackBarComponent
    ]
})
export class ComponentsModule { }
