import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ReleaseScheduleModel } from '../../models/release-schedule-model';
import { DialogDataService } from '../../service/diaog-data.service';

@Component({
  selector: 'roc-lib-dialog-release-schedule',
  templateUrl: './dialog-release-schedule.component.html',
  styleUrls: ['./dialog-release-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogReleaseScheduleComponent implements OnInit
{
  releaseList$: Observable<ReleaseScheduleModel[]>;

  constructor
    (
      private dialogDataService: DialogDataService
    ) { }

  ngOnInit(): void
  {
    this.releaseList$ = this.dialogDataService.getReleaseSchedule$();
  }

}
