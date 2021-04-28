import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AccordionFacadeService } from '@app/+state/accordion/facade.service';
import { AccordionPanelEnum, AccordionState } from '@app/+state/accordion/state';
import { CompareFacadeService } from '@app/+state/compare';
import { OffCanvasFacadeService } from '@app/+state/off-canvas';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { UserFacadeService } from '@app/+state/user';
import { CareerGoalForm, CurrentInformationForm, EducationCostForm } from '@app/core/models';
import { DialogDataToKeepModel, EducationFinancingDto, RoiModelDto, UserModelDto } from '@app/domain';
import { UserProfile } from '@gql';
import { Observable } from 'rxjs';


@Component({
  selector: 'roc-modeling-tool',
  templateUrl: './modeling-tool.component.html',
  styleUrls: ['./modeling-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelingToolComponent implements OnInit
{
  roiModelDto$: Observable<RoiModelDto>;
  userModelDto$: Observable<UserModelDto>;
  accordionState$: Observable<AccordionState>;
  userProfile$: Observable<UserProfile>;
  roiModelCount$: Observable<number>;
  isOffCanvasOpen$: Observable<boolean>;

  constructor
    (
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private accordionFacadeService: AccordionFacadeService,
      private compareFacadeService: CompareFacadeService,
      private userFacadeService: UserFacadeService,
      private offCanvasFacadeService: OffCanvasFacadeService,
  ) { }

  ngOnInit(): void
  {
    this.roiModelDto$ = this.roiCollectionFacadeService.getActiveRoiModelDto$();
    this.userModelDto$ = this.roiCollectionFacadeService.getActiveUserModelDto$();
    this.accordionState$ = this.accordionFacadeService.getSelectedAccordionModel$();
    this.userProfile$ = this.userFacadeService.getUserProfile$();
    this.roiModelCount$ = this.roiCollectionFacadeService.getRoiModelCount$();
    this.isOffCanvasOpen$ = this.offCanvasFacadeService.isOffCanvasOpened$();
  }

  onCurrentInformationSubmitted(currentInformationForm: CurrentInformationForm)
  {
    this.roiCollectionFacadeService.processCurrentInformationForm(currentInformationForm);
  }

  onCareerGoalSubmitted(careerGoalForm: CareerGoalForm)
  {
    this.roiCollectionFacadeService.processCareerGoalForm(careerGoalForm);
  }

  onEducationCostSubmitted(educationCostForm: EducationCostForm)
  {
    this.roiCollectionFacadeService.processEducationCostForm(educationCostForm);
  }

  onEducationFinancingSubmitted(educationFinancing: EducationFinancingDto)
  {
    this.roiCollectionFacadeService.processEducationFinancingForm(educationFinancing);
  }

  onCreateNewCollection()
  {
    this.roiCollectionFacadeService.createNewAggregate();
  }

  onResetAll()
  {
    this.roiCollectionFacadeService.resetAggregate();
    this.accordionFacadeService.resetAccordion();
    this.compareFacadeService.clearAll();
  }

  onPanelChange(accordionPanelEnum: AccordionPanelEnum)
  {
    this.accordionFacadeService.setActivePanel(accordionPanelEnum);
  }

  onClone(dialogDataToKeepModel: DialogDataToKeepModel)
  {
    this.roiCollectionFacadeService.cloneRoiModel(dialogDataToKeepModel);
  }

  onShowSaved(isOpen: boolean)
  {
    if (!isOpen)
    {
      this.offCanvasFacadeService.setOffCanvasOpen();
    }
    else
    {
      this.offCanvasFacadeService.setOffCanvasClosed();
    }
  }

  onRenameAggregate(name: string)
  {
    this.roiCollectionFacadeService.renameAggregate(name);
  }

  onRenameModel(name: string)
  {
    this.roiCollectionFacadeService.renameModel(name);
  }

}
