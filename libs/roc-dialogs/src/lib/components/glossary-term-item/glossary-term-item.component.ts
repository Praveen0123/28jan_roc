import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { GlossaryTermModel } from '../../models';

@Component({
  selector: 'roc-lib-glossary-term-item',
  templateUrl: './glossary-term-item.component.html',
  styleUrls: ['./glossary-term-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlossaryTermItemComponent implements OnInit
{
  @Input() glossaryTermModel: GlossaryTermModel;

  constructor() { }

  ngOnInit(): void
  {
  }

}
