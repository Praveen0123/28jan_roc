import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RoiAggregateCardModel } from '@gql';

@Component({
  selector: 'roc-collection-card-list',
  templateUrl: './collection-card-list.component.html',
  styleUrls: ['./collection-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionCardListComponent implements OnInit
{
  @Input() collectionList: RoiAggregateCardModel[];
  @Input() activeRoiAggregateId: string;

  @Output('onClickAggregate') clickRoiAggregateEventEmitter = new EventEmitter<RoiAggregateCardModel>();

  constructor() { }

  ngOnInit(): void
  {
  }

  onClickAggregate(roiAggregateCardModel: RoiAggregateCardModel)
  {
    if (this.clickRoiAggregateEventEmitter.observers.length > 0)
    {
      this.clickRoiAggregateEventEmitter.emit(roiAggregateCardModel);
    }
  }

}
