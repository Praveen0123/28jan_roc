import { Injectable } from '@angular/core';
import { RoiModelService } from '@app/domain';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { determineActiveAccordionPanel, setAccordionValidation, setActivePanel } from '../accordion/actions';
import { setActiveModels } from '../roi-collection/actions';
import { selectActiveAccordionPanel } from './selectors';
import { AccordionPanelEnum, AccordionValidation } from './state';


@Injectable()
export class AccordionEffects
{

  constructor
    (
      private store: Store,
      private actions$: Actions,
      private roiModelService: RoiModelService
    ) { }

  setActiveModels$ = createEffect(() => this.actions$.pipe
    (
      ofType(setActiveModels),
      map(() =>
      {
        const accordionValidation: AccordionValidation =
        {
          isCurrentInformationValid: this.roiModelService.isCurrentInformationValid(),
          isCareerGoalValid: this.roiModelService.isCareerGoalValid(),
          isEducationCostValid: this.roiModelService.isEducationCostValid()
        };

        return setAccordionValidation({ accordionValidation });
      })
    ));

  determineActiveAccordionPanel$ = createEffect(() => this.actions$.pipe
    (
      ofType(determineActiveAccordionPanel),
      withLatestFrom
        (
          this.store.pipe(select(selectActiveAccordionPanel))
        ),
      switchMap(([_, activeAccordionPanel]) =>
      {
        const isCurrentInformationValid: boolean = this.roiModelService.isCurrentInformationValid();
        const isCareerGoalValid: boolean = this.roiModelService.isCareerGoalValid();
        const isEducationCostValid: boolean = this.roiModelService.isEducationCostValid();

        const accordionPanel: AccordionPanelEnum = (!isCurrentInformationValid) ? AccordionPanelEnum.CURRENT_INFORMATION
          : (!isCareerGoalValid) ? AccordionPanelEnum.CAREER_GOAL
            : (!isEducationCostValid) ? AccordionPanelEnum.EDUCATION_COST
              : activeAccordionPanel;


        return [setActivePanel({ accordionPanel })];
      })
    ));

}
