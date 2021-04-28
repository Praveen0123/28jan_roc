import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';


@Injectable({
  providedIn: 'root'
})
export class ModelInitializationService implements Resolve<void>
{
  constructor
    (
      private roiCollectionFacadeService: RoiCollectionFacadeService
    ) { }

  resolve()
  {
    this.roiCollectionFacadeService.requestMostRecentAggregate();
  }
}
