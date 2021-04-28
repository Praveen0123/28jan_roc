import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CompareFacadeService } from '@app/+state/compare/facade.service';
import { OffCanvasFacadeService } from '@app/+state/off-canvas';
import { UserFacadeService } from '@app/+state/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'roc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit
{
  compareCount$: Observable<number>;

  constructor
    (
      private compareFacadeService: CompareFacadeService,
      private offCanvasFacadeService: OffCanvasFacadeService,
      private userFacadeService: UserFacadeService
    ) { }

  ngOnInit(): void
  {
    this.compareCount$ = this.compareFacadeService.getCompareCount$();
  }

  onLogout()
  {
    this.userFacadeService.requestLogout();
  }

  closeOffCanvasMenu()
  {
    this.offCanvasFacadeService.setOffCanvasClosed();
  }

}
