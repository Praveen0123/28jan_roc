import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform
{
  transform(input: number, args?: any): any
  {
    const suffixes = ['K', 'M', 'B', 'T'];

    if (input === undefined || input == null || Number.isNaN(input))
    {
      return 'N/A';
    }

    const isNegative = input < 0;
    const isSmallNumber = (input > -1000 && input < 1000);
    input = Math.abs(input);

    if (isSmallNumber)
    {
      return `${isNegative ? '-' : ''}$${input.toFixed(args)}`;
    }

    const exp = Math.floor(Math.log(input) / Math.log(1000));

    return `${isNegative ? '-' : ''}$${(input / Math.pow(1000, exp)).toFixed(args)}${suffixes[exp - 1]}`;
  }
}
