import { createAction, props } from '@ngrx/store';

import { AccordionPanelEnum, AccordionValidation } from './state';






export const setAccordionValidation = createAction
  (
    '[Accordion] set accordioin validation',
    props<{ accordionValidation: AccordionValidation; }>()
  );





export const setActivePanel = createAction
  (
    '[Accordion] set active panel',
    props<{ accordionPanel: AccordionPanelEnum; }>()
  );

export const resetAccordion = createAction
  (
    '[Accordion] reset accordion'
  );

export const determineActiveAccordionPanel = createAction
  (
    '[Accordion] determine active accordion panel'
  );
