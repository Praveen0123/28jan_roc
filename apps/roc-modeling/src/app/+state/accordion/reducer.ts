import { createReducer, on } from '@ngrx/store';

import { requestLogout } from '../user/actions';
import { resetAccordion, setAccordionValidation, setActivePanel } from './actions';
import { initialAccordionState } from './state';

export const accordionReducer = createReducer
  (

    initialAccordionState,

    on(setAccordionValidation, (state, { accordionValidation }) => ({
      ...state,
      isCurrentInformationValid: accordionValidation.isCurrentInformationValid,
      isCareerGoalValid: accordionValidation.isCareerGoalValid,
      isEducationCostValid: accordionValidation.isEducationCostValid
    })),


    on(setActivePanel, (state, { accordionPanel }) => ({ ...state, activePanel: accordionPanel })),

    on(resetAccordion, () => ({ ...initialAccordionState })),

    on(requestLogout, () => ({ ...initialAccordionState }))

  );
