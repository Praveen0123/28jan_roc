import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'roc-lib-dialog-title',
  templateUrl: './dialog-title.component.html',
  styleUrls: ['./dialog-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogTitleComponent implements OnInit
{

  ariaLabel: string;

  @Input() title: string;

  constructor() { }

  ngOnInit(): void
  {
    this.ariaLabel = `Close ${this.title} dialog`;
  }

}
