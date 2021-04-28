import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EducationLevelEnum } from '@app/core/models';
import { RocLegendData, RocPlotsVisibility } from '@app/domain/roi-model/models';


enum StateLabelEnum
{
  DEFAULT = 0,
  OCCUPATION_TITLE_ONLY = 1,
  OCCUPATION_AND_LOCATION = 2,
  LOCATION_ONLY = 3
}


@Component({
  selector: 'roc-lifetime-earnings-legend',
  templateUrl: './lifetime-earnings-legend.component.html',
  styleUrls: ['./lifetime-earnings-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LifetimeEarningsLegendComponent implements OnInit, OnChanges
{
  labelCurrentState: string;
  labelFutureState: string;

  @Input() data: RocLegendData;
  @Input() roiSectionsVisibility: RocPlotsVisibility;
  // @Input() currentStateOccupation: OccupationsEntity;
  // @Input() goalStateOccupation: OccupationsEntity;

  constructor() { }

  ngOnInit(): void
  {
    this.buildLegendLabels();
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes.data && !changes.data.firstChange)
    {
      this.buildLegendLabels();
    }
  }



  private buildLegendLabels(): void
  {
    this.labelCurrentState = this.determineCurrentStateLabel();
    this.labelFutureState = this.determineFutureStateLabel();
  }

  private getAdjustedDegreeLevel(degreeLevel: EducationLevelEnum)
  {
    const adjustedDegreeLevel = !degreeLevel ? null : degreeLevel.value < 0 ? EducationLevelEnum.HighSchoolGraduate : degreeLevel;
    return (adjustedDegreeLevel) ? ` with ${adjustedDegreeLevel.indefiniteArticle} ${adjustedDegreeLevel.displayName}` : '';
  }

  private determineCurrentStateLabel(): string
  {
    const currentStateLabelEnum: StateLabelEnum = this.getCurrentState();
    const degreeLevel = this.getAdjustedDegreeLevel(this.data.currentStateDegreeLevel);

    const labelMap: Map<StateLabelEnum, Function> = new Map();
    labelMap.set(StateLabelEnum.DEFAULT, () => 'Current lifetime earnings');
    labelMap.set(StateLabelEnum.OCCUPATION_TITLE_ONLY, () => `${this.data.currentStateOccupationTitle} lifetime earnings`);
    labelMap.set(StateLabelEnum.OCCUPATION_AND_LOCATION, () => `${this.data.currentStateOccupationTitle} lifetime earnings in ${this.data.currentLocation.cityName}, ${this.data.currentLocation.stateAbbreviation} ${degreeLevel}`);
    labelMap.set(StateLabelEnum.LOCATION_ONLY, () => `Lifetime earnings in ${this.data.currentLocation.cityName}, ${this.data.currentLocation.stateAbbreviation} ${degreeLevel}`);

    return (labelMap.get(currentStateLabelEnum) || labelMap.get(StateLabelEnum.DEFAULT))();
  }

  private determineFutureStateLabel(): string
  {
    const futureStateLabelEnum: StateLabelEnum = this.getFutureState();
    const degreeLevel = this.getAdjustedDegreeLevel(this.data.goalStateDegreeLevel);
    const degreeProgram: string = (this.data.goalStateDegreeProgram) ? ` in ${this.data.goalStateDegreeProgram.cipTitle}` : '';

    const labelMap: Map<StateLabelEnum, Function> = new Map();
    labelMap.set(StateLabelEnum.DEFAULT, () => 'Future lifetime earnings');
    labelMap.set(StateLabelEnum.OCCUPATION_TITLE_ONLY, () => `${this.data.goalStateOccupationTitle} lifetime earnings`);
    labelMap.set(StateLabelEnum.OCCUPATION_AND_LOCATION, () => `${this.data.goalStateOccupationTitle} lifetime earnings in ${this.data.goalLocation.cityName}, ${this.data.goalLocation.stateAbbreviation} ${degreeLevel} ${degreeProgram}`);
    labelMap.set(StateLabelEnum.LOCATION_ONLY, () => `Lifetime earnings in ${this.data.goalLocation.cityName}, ${this.data.goalLocation.stateAbbreviation} ${degreeLevel} ${degreeProgram}`);

    return (labelMap.get(futureStateLabelEnum) || labelMap.get(StateLabelEnum.DEFAULT))();
  }


  private getCurrentState(): StateLabelEnum
  {
    return (this.data.currentStateOccupationTitle && this.data.currentLocation)
      ? StateLabelEnum.OCCUPATION_AND_LOCATION
      : (!this.data.currentStateOccupationTitle && this.data.currentLocation)
        ? StateLabelEnum.LOCATION_ONLY
        : (this.data.currentStateOccupationTitle)
          ? StateLabelEnum.OCCUPATION_TITLE_ONLY
          : StateLabelEnum.DEFAULT;
  }

  private getFutureState(): StateLabelEnum
  {
    return (this.data.goalStateOccupationTitle && this.data.goalLocation)
      ? StateLabelEnum.OCCUPATION_AND_LOCATION
      : (!this.data.goalStateOccupationTitle && this.data.goalLocation)
        ? StateLabelEnum.LOCATION_ONLY
        : (this.data.goalStateOccupationTitle)
          ? StateLabelEnum.OCCUPATION_TITLE_ONLY
          : StateLabelEnum.DEFAULT;
  }

}
