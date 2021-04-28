import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ConsoleLogPipe } from './consoleLog/console-log.pipe';
import { MoneyPipe } from './money/money.pipe';
import { PluralPipe } from './plural/plural.pipe';

@NgModule({
  imports:
    [
      CommonModule
    ],
  declarations:
    [
      ConsoleLogPipe,
      MoneyPipe,
      PluralPipe
    ],
  exports:
    [
      ConsoleLogPipe,
      MoneyPipe,
      PluralPipe
    ]
})
export class PipesModule { }
