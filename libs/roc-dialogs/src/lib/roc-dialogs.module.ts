import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { SharedMaterialModule } from '../shared/material.module';
import { DialogTitleComponent } from './components/dialog-title/dialog-title.component';
import { ReleaseScheduleItemComponent } from './components/release-schedule-item/release-schedule-item.component';
import { DialogAboutDataComponent } from './dialogs/dialog-about-data/dialog-about-data.component';
import { DialogAboutToolComponent } from './dialogs/dialog-about-tool/dialog-about-tool.component';
import { DialogFeedbackFormComponent } from './dialogs/dialog-feedback-form/dialog-feedback-form.component';
import { DialogGlossaryOfTermsComponent } from './dialogs/dialog-glossary-of-terms/dialog-glossary-of-terms.component';
import { DialogReleaseScheduleComponent } from './dialogs/dialog-release-schedule/dialog-release-schedule.component';
import { GlossaryTermItemComponent } from './components/glossary-term-item/glossary-term-item.component';
import { SvgAboutDataComponent } from './components/images/svg-about-data/svg-about-data.component';
import { SvgEarningsExampleComponent } from './components/images/svg-earnings-example/svg-earnings-example.component';
import { SvgPathway2Component } from './components/images/svg-pathway2/svg-pathway2.component';
import { SvgPathway1Component } from './components/images/svg-pathway1/svg-pathway1.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports:
    [
      CommonModule,
      HttpClientModule,
      SharedMaterialModule,
      FontAwesomeModule,
      FormsModule, ReactiveFormsModule

    ],
  declarations:
    [
      DialogAboutDataComponent,
      DialogTitleComponent,
      DialogAboutToolComponent,
      DialogGlossaryOfTermsComponent,
      DialogReleaseScheduleComponent,
      ReleaseScheduleItemComponent,
      GlossaryTermItemComponent,
      SvgAboutDataComponent,
      SvgEarningsExampleComponent,
      SvgPathway2Component,
      SvgPathway1Component,
      DialogFeedbackFormComponent
    ],
  exports:
    [
      DialogAboutDataComponent,
      DialogAboutToolComponent,
      DialogGlossaryOfTermsComponent,
      DialogReleaseScheduleComponent,
      DialogFeedbackFormComponent
    ]
})
export class RocDialogsModule { }
