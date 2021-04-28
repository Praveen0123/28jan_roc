import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import glossaryData from '../../data/glossary-of-terms.json';
import releaseScheduleData from '../../data/release-schedule.json';
import { GlossaryTermModel, ReleaseScheduleModel } from '../models';



@Injectable({
  providedIn: 'root'
})
export class DialogDataService
{

  constructor
    (
    ) { }

  getGlossaryTerm$(): Observable<GlossaryTermModel[]>
  {
    return of(glossaryData);
  }

  getReleaseSchedule$(): Observable<ReleaseScheduleModel[]>
  {
    return of(releaseScheduleData);
  }
}
