import { EducationLevelEnum } from '@app/core/models';
import { InstructionalProgram, Location } from '@gql';

export interface RocLegendData
{
  modelName: string;
  currentLocation: Location;
  goalLocation: Location;
  currentStateOccupationTitle: string;
  goalStateOccupationTitle: string;
  currentStateDegreeLevel: EducationLevelEnum;
  goalStateDegreeLevel: EducationLevelEnum;
  goalStateDegreeProgram: InstructionalProgram;
  currentStateLifetimeEarningLower: number;
  currentStateLifetimeEarningUpper: number;
  goalStateLifetimeEarningLower: number;
  goalStateLifetimeEarningUpper: number;
  investmentLower: number;
  investmentUpper: number;
  totalLoanAmount: number;
  lifeRoiLower: number;
  lifeRoiUpper: number;
  lifeRoiPercentLower: number;
  lifeRoiPercentUpper: number;
  annualizedRoiPercentLower: number;
  annualizedRoiPercentUpper: number;
}
