import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SpinnerFacadeService } from '@app/+state/spinner-store';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor
{

  constructor
    (
      private spinnerFacadeService: SpinnerFacadeService
    ) { }


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>>
  {
    const url: string = req.url;

    if (url.startsWith('/assets'))
    {
      return next.handle(req);
    }

    if (req.headers.has('x-silent-header'))
    {
      // console.log('SSSHHHHHH', req.headers.has('x-silent-header'));
      return next.handle(req);
    }

    this.showLoader();

    return next.handle(req).pipe(finalize(() => this.onEnd()));
  }


  private onEnd(): void
  {
    this.hideLoader();
  }

  private showLoader(): void
  {
    this.spinnerFacadeService.showSpinner();
  }

  private hideLoader(): void
  {
    this.spinnerFacadeService.hideSpinner();
  }
}
