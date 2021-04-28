import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CollectionFilterEnum } from '@app/+state/roi-collection/state';

@Component({
  selector: 'roc-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFilterComponent implements OnInit, OnChanges
{
  formGroup: FormGroup;
  isAllMyCollectionsActive: boolean;
  isBySearchStringCollectionsActive: boolean;
  isMostRecentCollectionsActive: boolean;
  isSharedFromCollectionsActive: boolean;
  isSharedWithCollectionsActive: boolean;

  @Input() collectionFilterType: CollectionFilterEnum;
  @Output('onRequestAllCollections') requestAllCollectionsEventEmitter = new EventEmitter<void>();
  @Output('onRequestCollectionsBySearchTermCollections') requestCollectionsBySearchTermEventEmitter = new EventEmitter<string>();
  @Output('onRequestMostRecentCollections') requestMostRecentCollectionsEventEmitter = new EventEmitter<void>();
  @Output('onRequestSharedFromCollections') requestSharedFromCollectionsEventEmitter = new EventEmitter<void>();
  @Output('onRequestSharedWithCollections') requestSharedWithCollectionsEventEmitter = new EventEmitter<void>();

  constructor
    (
      private formBuilder: FormBuilder
    ) { }

  ngOnInit(): void
  {
    this.buildForm();
    this.checkCollectionType();
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes.collectionFilterType && !changes.collectionFilterType.firstChange)
    {
      this.checkCollectionType();
    }
  }

  onSearchClick(): void
  {
    if (this.formGroup.valid)
    {
      const searchTerm: string = this.formGroup.controls.searchTerm.value;

      this.onRequestCollectionsBySearchTermCollections(searchTerm);
    }
  }

  onRequestAllCollections()
  {
    if (this.requestAllCollectionsEventEmitter.observers.length > 0)
    {
      this.requestAllCollectionsEventEmitter.emit();
    }
  }
  onRequestCollectionsBySearchTermCollections(searchTerm: string)
  {
    if (this.requestCollectionsBySearchTermEventEmitter.observers.length > 0)
    {
      this.requestCollectionsBySearchTermEventEmitter.emit(searchTerm);
    }
  }
  onRequestMostRecentCollections()
  {
    if (this.requestMostRecentCollectionsEventEmitter.observers.length > 0)
    {
      this.requestMostRecentCollectionsEventEmitter.emit();
    }
  }
  onRequestSharedFromCollections()
  {
    if (this.requestSharedFromCollectionsEventEmitter.observers.length > 0)
    {
      this.requestSharedFromCollectionsEventEmitter.emit();
    }
  }
  onRequestSharedWithCollections()
  {
    if (this.requestSharedWithCollectionsEventEmitter.observers.length > 0)
    {
      this.requestSharedWithCollectionsEventEmitter.emit();
    }
  }

  clearSearchTermValue()
  {
    this.formGroup.controls.searchTerm.patchValue('');
  }


  private buildForm()
  {
    this.formGroup = this.formBuilder.group
      ({
        searchTerm: new FormControl('', [Validators.required])
      });
  }

  private checkCollectionType()
  {
    this.isAllMyCollectionsActive = (this.collectionFilterType === CollectionFilterEnum.ALL);
    this.isBySearchStringCollectionsActive = (this.collectionFilterType === CollectionFilterEnum.BY_SEARCH_TERM);
    this.isMostRecentCollectionsActive = (this.collectionFilterType === CollectionFilterEnum.MOST_RECENT);
    this.isSharedFromCollectionsActive = (this.collectionFilterType === CollectionFilterEnum.SHARED_FROM);
    this.isSharedWithCollectionsActive = (this.collectionFilterType === CollectionFilterEnum.SHARED_WITH);
  }

}
