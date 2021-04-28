import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { NotificationService } from '@app/core/services/notification/notification.service';
import { RoiModelService, RoiModelToSaveDto } from '@app/domain';
import { map, takeWhile } from 'rxjs/operators';

import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
import { DialogShareHistoryComponent } from '../dialog-share-history/dialog-share-history.component';

@Component({
  selector: 'roc-collection-call-to-action',
  templateUrl: './collection-call-to-action.component.html',
  styleUrls: ['./collection-call-to-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionCallToActionComponent implements OnInit, OnDestroy
{
  alive: boolean = true;

  @Input() roiAggregateId: string;
  @Input() roiAggregateName: string;
  @Input() isAddModelToAggregateAvailable: boolean;

  constructor
    (
      private roiModelService: RoiModelService,
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private notificationService: NotificationService,
      private clipboard: Clipboard,
      private dialog: MatDialog
    ) { }


  ngOnInit(): void
  {
    this.isAddModelToAggregateAvailable = this.isAddModelToAggregateAvailable ?? false;
  }

  ngOnDestroy(): void
  {
    this.alive = false;
  }

  async onCopyRoiAggregateModel()
  {
    const roiModelToSaveDto: RoiModelToSaveDto = await this.roiModelService.fromAggregateToSaveModel();

    const pending = this.clipboard.beginCopy(JSON.stringify(roiModelToSaveDto));
    let remainingAttempts = 3;

    const attempt = () =>
    {
      const pendingCopy = pending.copy();

      if (!pendingCopy && --remainingAttempts)
      {
        setTimeout(attempt);
      }
      else
      {
        this.notificationService.success('copy successful');
        // Remember to destroy when you're done!
        pending.destroy();
      }
    };
    attempt();
  }

  onShareClick(): void
  {
    this.roiCollectionFacadeService.requestShareRoiAggregate(this.roiAggregateId);
  }

  onViewShareHistoryClick(): void
  {
    this.dialog.open(DialogShareHistoryComponent,
      {
        data: this.roiAggregateId
      });
  }

  onAddNewModel(): void
  {
    this.roiCollectionFacadeService.createNewRoiModel();
  }

  onDeleteCollection(): void
  {
    const message = `Are you sure you want to delete ${this.roiAggregateName}?`;

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
            this.roiCollectionFacadeService.requestDeleteRoiAggregate(this.roiAggregateId);
          }
        })
      )
      .subscribe();
  }

}
