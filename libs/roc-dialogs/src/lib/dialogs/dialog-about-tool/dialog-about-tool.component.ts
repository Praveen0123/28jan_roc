import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'roc-lib-dialog-about-tool',
  templateUrl: './dialog-about-tool.component.html',
  styleUrls: ['./dialog-about-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAboutToolComponent implements OnInit
{

  constructor() { }

  ngOnInit(): void
  {
  }

}
