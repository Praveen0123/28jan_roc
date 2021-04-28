import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { InstitutionModel, RoiAggregateCardModel } from '@gql';

@Component({
  selector: 'roc-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionCardComponent implements OnInit, OnChanges
{
  hasSelectedInstitutions: boolean;
  isActive: boolean;

  @Input() roiAggregateCardModel: RoiAggregateCardModel;
  @Input() activeRoiAggregateId: string;
  @Output('onClickAggregate') clickRoiAggregateEventEmitter = new EventEmitter<RoiAggregateCardModel>();

  constructor() { }

  ngOnInit(): void
  {
    this.checkInstitution();
    this.checkIsActive();
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes.roiAggregateModel && !changes.roiAggregateModel.firstChange)
    {
      this.checkInstitution();
      this.checkIsActive();
    }
  }

  onClickAggregate()
  {
    if (this.clickRoiAggregateEventEmitter.observers.length > 0)
    {
      this.clickRoiAggregateEventEmitter.emit(this.roiAggregateCardModel);
    }
  }


  private checkInstitution(): void
  {
    this.hasSelectedInstitutions = (this.roiAggregateCardModel.institutionList?.some((item: InstitutionModel) => item.name));
  }
  private checkIsActive(): void
  {
    this.isActive = (this.roiAggregateCardModel.roiAggregateId === this.activeRoiAggregateId);
  }
}
