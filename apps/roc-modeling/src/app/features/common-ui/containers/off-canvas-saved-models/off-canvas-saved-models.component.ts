import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CompareFacadeService } from '@app/+state/compare';
import { OffCanvasFacadeService } from '@app/+state/off-canvas';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { RoiModelDto } from '@app/domain';
import { DialogConfirmationComponent } from '@app/shared/components/dialog-confirmation/dialog-confirmation.component';
import { Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'roc-off-canvas-saved-models',
  templateUrl: './off-canvas-saved-models.component.html',
  styleUrls: ['./off-canvas-saved-models.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffCanvasSavedModelsComponent implements OnInit, OnDestroy
{
  alive: boolean = true;

  roiModelList$: Observable<RoiModelDto[]>;
  compareIdList$: Observable<string[] | number[]>;
  selectedRoiModelId$: Observable<string>;

  constructor
    (
      private compareFacadeService: CompareFacadeService,
      private offCanvasFacadeService: OffCanvasFacadeService,
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private dialog: MatDialog,
  ) { }

  ngOnInit(): void
  {
    this.roiModelList$ = this.roiCollectionFacadeService.getRoiModelList$();
    this.compareIdList$ = this.compareFacadeService.getCompareIdList$();
    this.selectedRoiModelId$ = this.roiCollectionFacadeService.getSelectedRoiModelId$();
  }

  ngOnDestroy()
  {
    this.alive = false;
  }

  onAddNewModel()
  {
    this.roiCollectionFacadeService.createNewRoiModel();
  }

  onClose()
  {
    this.offCanvasFacadeService.setOffCanvasClosed();
  }

  onMakeActive(roiModelDto: RoiModelDto)
  {
    this.roiCollectionFacadeService.requestMakeRoiModelActive(roiModelDto);
    this.offCanvasFacadeService.setOffCanvasClosed();
  }

  onCompare(isCompare: boolean, roiModelDto: RoiModelDto)
  {
    if (isCompare)
    {
      this.compareFacadeService.addToCompare(roiModelDto);
    }
    else
    {
      this.compareFacadeService.removeRoiAggregateFromCompare(roiModelDto);
    }
  }

  onDelete(roiModelDto: RoiModelDto)
  {
    const message = `Are you sure you want to delete ${roiModelDto.name} model?`;

    const dialogRef = this.dialog.open(DialogConfirmationComponent,
      {
        data: { message: message },
        disableClose: true
      });

    dialogRef
      .afterClosed()
      .pipe
      (
        takeWhile(() => this.alive),
        map((isConfirmed: boolean) =>
        {
          if (isConfirmed)
          {
            this.roiCollectionFacadeService.deleteRoiModel(roiModelDto);
          }
        })
      )
      .subscribe();

  }


}
