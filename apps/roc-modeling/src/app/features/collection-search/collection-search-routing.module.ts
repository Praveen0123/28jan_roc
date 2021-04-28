import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchCollectionsComponent } from './containers/search-collections/search-collections.component';
import { CollectionSearchResolverService } from './services/collection-search-resolver.service';

const routes: Routes =
  [
    {
      path: '',
      component: SearchCollectionsComponent,
      resolve: { resolver: CollectionSearchResolverService }
    }
  ];

@NgModule({
  imports:
    [
      RouterModule.forChild(routes)
    ],
  exports:
    [
      RouterModule
    ]
})
export class CollectionSearchRoutingModule { }
