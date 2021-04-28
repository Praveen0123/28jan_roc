import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'roc-lib-svg-pathway1',
  templateUrl: './svg-pathway1.component.svg',
  styleUrls: ['./svg-pathway1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgPathway1Component implements OnInit
{

  constructor() { }

  ngOnInit(): void
  {
  }

}
