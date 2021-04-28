import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'roc-lib-svg-earnings-example',
  templateUrl: './svg-earnings-example.component.svg',
  styleUrls: ['./svg-earnings-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgEarningsExampleComponent implements OnInit
{

  constructor() { }

  ngOnInit(): void
  {
  }

}
