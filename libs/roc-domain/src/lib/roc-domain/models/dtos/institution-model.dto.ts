import { AvgGrantScholarshipAidBreakdownModel, AvgGrantScholarshipAidByIncomeModel, CostOfAttendanceModel } from '../interfaces';

export interface InstitutionModelDto
{
  name: string;
  costOfAttendanceModel: CostOfAttendanceModel;
  avgGrantScholarshipAidBreakdownModel: AvgGrantScholarshipAidBreakdownModel;
  avgGrantScholarshipAidByIncomeModel: AvgGrantScholarshipAidByIncomeModel;
}
