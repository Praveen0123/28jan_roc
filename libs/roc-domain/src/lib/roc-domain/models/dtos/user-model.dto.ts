import { EducationLevelEnum, IncomeRangeEnum } from '../enums';
import { LocationModelDto } from './location-model.dto';
import { OccupationModelDto } from './occupation-model.dto';


export interface UserModelDto
{
  currentAge: number;
  occupationModel?: OccupationModelDto;
  locationModel: LocationModelDto;
  educationLevel: EducationLevelEnum;
  incomeRange: IncomeRangeEnum;
  expectedFamilyContribution: number;
}
