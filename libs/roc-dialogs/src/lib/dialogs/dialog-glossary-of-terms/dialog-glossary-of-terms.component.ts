import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { GlossaryTermModel } from '../../models';
import { DialogDataService } from '../../service/diaog-data.service';

@Component({
  selector: 'roc-lib-dialog-glossary-of-terms',
  templateUrl: './dialog-glossary-of-terms.component.html',
  styleUrls: ['./dialog-glossary-of-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogGlossaryOfTermsComponent implements OnInit
{

  glossaryList$: Observable<GlossaryTermModel[]>;

  constructor
    (
      private dialogDataService: DialogDataService
    ) { }

  ngOnInit(): void
  {
    this.glossaryList$ = this.dialogDataService.getGlossaryTerm$();
  }

}
