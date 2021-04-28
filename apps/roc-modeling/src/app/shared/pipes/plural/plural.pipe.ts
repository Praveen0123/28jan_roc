import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plural'
})
export class PluralPipe implements PipeTransform
{

  transform(count: number, label: string, includeCountInResults: boolean = true): string
  {
    label = (label === undefined) ? 'item' : label;

    // ACCOUNT FOR WORDS THAT END IN 'Y' WHERE PLURAL WOULD BE 'IES'
    if ((count !== 1) && (label.substr(label.length - 1) === 'y'))
    {
      label = label.slice(0, -1) + 'ies';
    }
    // ACCOUNT FOR WORDS THAT END IN 'CH' WHERE PLURAL WOULD BE 'CHES'
    else if ((count !== 1) && (label.substr(label.length - 2) === 'ch'))
    {
      label = label + 'es';
    }
    else
    {
      label = (count === 1) ? label : label + 's';
    }

    return (includeCountInResults) ? `<span class="plural-count">${count} ${label}</span>`
      : `<span class="plural-count">${label}</span>`;
  }

}
