import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { CollectionFilterEnum } from '@app/+state/roi-collection/state';
import { SpinnerFacadeService } from '@app/+state/spinner-store';
import { RoiAggregateCardModel } from '@gql';
import { Observable } from 'rxjs';

@Component({
  selector: 'roc-search-collections',
  templateUrl: './search-collections.component.html',
  styleUrls: ['./search-collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchCollectionsComponent implements OnInit
{
  collectionList$: Observable<RoiAggregateCardModel[]>;
  activeRoiAggregateId$: Observable<string>;
  collectionFilterType$: Observable<CollectionFilterEnum>;
  isSpinnerActive$: Observable<boolean>;

  constructor
    (
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private spinnerFacadeService: SpinnerFacadeService
    ) { }

  ngOnInit(): void
  {
    this.collectionList$ = this.roiCollectionFacadeService.getCollection$();
    this.activeRoiAggregateId$ = this.roiCollectionFacadeService.getActiveRoiAggregateId$();
    this.collectionFilterType$ = this.roiCollectionFacadeService.getCollectionFilterType$();
    this.isSpinnerActive$ = this.spinnerFacadeService.isSpinnerActive$();
  }

  onClickAggregate(roiAggregateCardModel: RoiAggregateCardModel)
  {
    this.roiCollectionFacadeService.requestRoiAggregateFromSearchPage(roiAggregateCardModel);
  }

  onRequestAllCollections()
  {
    this.roiCollectionFacadeService.requestCollectionAllFromDatastore();
  }

  onRequestCollectionsBySearchTermCollections(searchTerm: string)
  {
    this.roiCollectionFacadeService.requestCollectionBySearchTermFromDatastore(searchTerm);
  }

  onRequestMostRecentCollections()
  {
    this.roiCollectionFacadeService.requestCollectionMostRecentFromDatastore();
  }

  onRequestSharedFromCollections()
  {
    this.roiCollectionFacadeService.requestCollectionSharedFromFromDatastore();
  }

  onRequestSharedWithCollections()
  {
    this.roiCollectionFacadeService.requestCollectionSharedWithFromDatastore();
  }

}
