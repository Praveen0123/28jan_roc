import { LivingConditionTypeEnum, ResidencyTypeEnum } from '../enums';
import { GrantsModelDto } from './grants-model.dto';
import { RefineCostOfAttendanceModelDto } from './refine-cost-of-attendance-model.dto';

export interface RefineEducationCostModelDto
{
  residencyType: ResidencyTypeEnum;
  livingConditionTypeEnum: LivingConditionTypeEnum;
  costOfAttendance: RefineCostOfAttendanceModelDto;
  grantsModel: GrantsModelDto;
  expectedFamilyContribution: number;
}
