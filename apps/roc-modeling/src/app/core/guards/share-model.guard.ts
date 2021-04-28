import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { ShareRoiAggregateModel } from '@app/+state/roi-collection/state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NavigationService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class ShareModelGuard implements CanActivate
{
  constructor
    (
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private navigationService: NavigationService
    ) { }

  canActivate(): Observable<boolean>
  {
    return this.roiCollectionFacadeService.getInProgressShareRoiAggregateModel$()
      .pipe
      (
        map((shareRoiAggregateModel: ShareRoiAggregateModel) =>
        {
          if (shareRoiAggregateModel)
          {
            return true;
          }

          this.navigationService.goToModelingPage();

          return false;
        })
      );
  }
}
