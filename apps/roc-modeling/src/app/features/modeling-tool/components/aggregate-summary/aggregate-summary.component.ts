import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RoiModelDto } from '@app/domain';
import { DialogRenameComponent } from '@app/shared/components/dialog-rename/dialog-rename.component';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'roc-aggregate-summary',
  templateUrl: './aggregate-summary.component.html',
  styleUrls: ['./aggregate-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregateSummaryComponent implements OnInit, OnDestroy
{
  private alive: boolean = true;

  @Input() roiModelDto: RoiModelDto;
  @Input() roiModelCount: number;
  @Output('onRename') renameEventEmitter = new EventEmitter<string>();
  @Output('onShowSavedModels') showSavedModelsEventEmitter = new EventEmitter<void>();

  constructor
    (
      private dialog: MatDialog
    ) { }

  ngOnInit(): void
  {
  }

  ngOnDestroy(): void
  {
    this.alive = false;
  }

  onRename()
  {
    const dialogRef = this.dialog.open(DialogRenameComponent,
      {
        data: this.roiModelDto.roiAggregateName
      });

    dialogRef.afterClosed()
      .pipe
      (
        takeWhile(() => this.alive),
        map((result: string) =>
        {
          if (result && this.renameEventEmitter.observers.length > 0)
          {
            this.renameEventEmitter.emit(result);
          }
        })
      ).subscribe();
  }

  onShowSaved()
  {
    if (this.showSavedModelsEventEmitter.observers.length > 0)
    {
      this.showSavedModelsEventEmitter.emit();
    }
  }
}
