import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ReleaseScheduleItemStatusEnum, ReleaseScheduleModel } from '../../models/release-schedule-model';

@Component({
  selector: 'roc-lib-release-schedule-item',
  templateUrl: './release-schedule-item.component.html',
  styleUrls: ['./release-schedule-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReleaseScheduleItemComponent implements OnInit
{
  progressStyle: string;

  @Input() releaseScheduleModel: ReleaseScheduleModel;

  constructor() { }

  ngOnInit(): void
  {
    this.progressStyle = this.determineProgressStyle();
  }


  private determineProgressStyle(): string
  {
    const releaseScheduleItemStatus: ReleaseScheduleItemStatusEnum = this.releaseScheduleModel.versionStatus as ReleaseScheduleItemStatusEnum;

    const styleMap: Map<ReleaseScheduleItemStatusEnum, Function> = new Map();
    styleMap.set(ReleaseScheduleItemStatusEnum.COMPLETED, () => 'completed');
    styleMap.set(ReleaseScheduleItemStatusEnum.IN_PROGRESS, () => 'in-progress');
    styleMap.set(ReleaseScheduleItemStatusEnum.PLANNED, () => 'planned');

    return (styleMap.get(releaseScheduleItemStatus) || styleMap.get(ReleaseScheduleItemStatusEnum.PLANNED))();
  }

}
