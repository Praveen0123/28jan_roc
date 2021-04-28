import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'roc-lib-dialog-about-data',
  templateUrl: './dialog-about-data.component.html',
  styleUrls: ['./dialog-about-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAboutDataComponent implements OnInit
{

  constructor() { }

  ngOnInit(): void
  {
  }

}
