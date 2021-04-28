import { RocCalculatorInput, RocCalculatorOutputModel } from '../calculator';
import { EducationLevelEnum, LivingConditionTypeEnum, ResidencyTypeEnum } from '../enums';
import { EducationFinancingModelDto } from './education-financing-model.dto';
import { GrantsModelDto } from './grants-model.dto';
import { InstitutionModelDto } from './institution-model.dto';
import { InstructionalProgramModelDto } from './instructional-program-model.dto';
import { LocationModelDto } from './location-model.dto';
import { OccupationModelDto } from './occupation-model.dto';


export interface RocModelDto
{
  rocModelId?: string;
  name: string;

  locationModel: LocationModelDto;
  occupationModel: OccupationModelDto;
  degreeLevel: EducationLevelEnum;
  degreeProgram: InstructionalProgramModelDto;
  retirementAge: number;

  institutionModel: InstitutionModelDto;
  startYear: number;
  isFulltime: boolean;
  yearsToCompleteDegree: number;

  residencyType: ResidencyTypeEnum;
  livingConditionTypeEnum: LivingConditionTypeEnum;
  grantsModel: GrantsModelDto;

  educationFinancingModel: EducationFinancingModelDto;

  radiusInMiles: number;

  rocCalculatorInput: RocCalculatorInput;
  rocCalculatorOutput: RocCalculatorOutputModel;

  costOfAttendanceByYear: number[];
  grantsByYear: number[];
  netPriceByYear: number[];
  federalSubsidizedLoanLimitByYear: number[];
  federalUnsubsidizedLoanLimitByYear: number[];
  outOfPocketExpensesByYear: number[];

  modelHash: string;
}
