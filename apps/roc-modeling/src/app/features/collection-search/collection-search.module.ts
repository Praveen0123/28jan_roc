import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { TimeagoModule } from 'ngx-timeago';

import { CollectionSearchRoutingModule } from './collection-search-routing.module';
import { CollectionCardListComponent } from './components/collection-card-list/collection-card-list.component';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { SearchCollectionsComponent } from './containers/search-collections/search-collections.component';


@NgModule({
  imports:
    [
      CommonModule,
      CollectionSearchRoutingModule,
      SharedModule,
      TimeagoModule.forChild({})
    ],
  declarations:
    [
      CollectionCardListComponent,
      CollectionCardComponent,
      SearchCollectionsComponent,
      SearchFilterComponent
    ]
})
export class CollectionSearchModule { }
