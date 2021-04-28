import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'roc-lib-svg-about-data',
  templateUrl: './svg-about-data.component.svg',
  styleUrls: ['./svg-about-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgAboutDataComponent implements OnInit
{

  constructor() { }

  ngOnInit(): void
  {
  }

}
