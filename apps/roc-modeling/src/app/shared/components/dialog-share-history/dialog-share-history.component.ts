import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { SharedHistoryDialogModel } from '@app/+state/roi-collection/state';
import { Observable } from 'rxjs';

@Component({
  selector: 'roc-dialog-share-history',
  templateUrl: './dialog-share-history.component.html',
  styleUrls: ['./dialog-share-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogShareHistoryComponent implements OnInit
{
  sharedHistoryDialoModel$: Observable<SharedHistoryDialogModel>;

  constructor
    (
      private dialogRef: MatDialogRef<DialogShareHistoryComponent>,
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      @Inject(MAT_DIALOG_DATA) private data: string
    ) { }

  ngOnInit(): void
  {
    this.sharedHistoryDialoModel$ = this.roiCollectionFacadeService.getShareHistory$(this.data);
  }

  onCancelClick(): void
  {
    this.dialogRef.close();
  }

}
