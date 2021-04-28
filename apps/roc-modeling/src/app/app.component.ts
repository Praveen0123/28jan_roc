import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { FontAwesomeIconRegistryService } from '@core/services/icon-registry/font-awesome-icon-registry.service';
import { UseCaseError } from '@vantage-point/ddd-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

import { OffCanvasFacadeService } from './+state/off-canvas';
import { SpinnerFacadeService } from './+state/spinner-store';
import { UserFacadeService } from './+state/user';
import { NotificationService } from './core/services/notification/notification.service';
import { RoiModelService } from './domain';


@Component({
  selector: 'roc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy
{
  private alive: boolean = true;
  private timer: any = null;

  isAuthenticated$: Observable<boolean>;
  hasCompletedOnboarding$: Observable<boolean>;
  isOffCanvasOpen$: Observable<boolean>;

  constructor
    (
      private fontAwesomeIconRegistryService: FontAwesomeIconRegistryService,
      private userFacadeService: UserFacadeService,
      private offCanvasFacadeService: OffCanvasFacadeService,
      private roiModelService: RoiModelService,
      private notificationService: NotificationService,
      private authService: AuthService,
      private spinnerFacadeService: SpinnerFacadeService,
      private spinner: NgxSpinnerService
    )
  {
    this.fontAwesomeIconRegistryService.init();
  }

  ngOnInit(): void
  {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.hasCompletedOnboarding$ = this.userFacadeService.hasCompletedOnboarding$();
    this.isOffCanvasOpen$ = this.offCanvasFacadeService.isOffCanvasOpened$();

    // MONITOR SPINNER COUNT
    this.spinnerFacadeService.getSpinnerCount$()
      .pipe
      (
        takeWhile(() => this.alive),
        map((spinnerCount: number) =>
        {
          clearTimeout(this.timer);

          this.timer = setTimeout(() =>
          {
            if (spinnerCount !== 0)
            {
              this.showSpinner();
            }
            else
            {
              this.hideSpinner();
            }
          }, (spinnerCount !== 0) ? 0 : 300);

        })
      ).subscribe();


    this.roiModelService.roiModelError$
      .pipe
      (
        takeWhile(() => this.alive),
        map((err: UseCaseError) =>
        {
          if (err)
          {
            this.notificationService.error(err);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void
  {
    this.alive = false;
  }


  private showSpinner()
  {
    this.spinner.show(undefined,
      {
        bdColor: 'rgba(51,51,51,0.8)',
        color: 'white',
        fullScreen: true,
        size: 'large',
        type: 'square-jelly-box'
      }
    );
  }

  private hideSpinner()
  {
    this.spinner.hide();
  }

}
