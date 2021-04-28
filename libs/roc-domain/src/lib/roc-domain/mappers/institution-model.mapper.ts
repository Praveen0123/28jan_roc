import { IMapper, Result } from '@vantage-point/ddd-core';

import { InstitutionModel } from '../domain';
import { InstitutionModelDto } from '../models';


export class InstitutionModelMapper implements IMapper<InstitutionModel, InstitutionModelDto>
{
  private constructor()
  {
  }

  public static create(): InstitutionModelMapper
  {
    return new InstitutionModelMapper();
  }

  toDTO(input: InstitutionModel): InstitutionModelDto
  {
    const dto: InstitutionModelDto =
    {
      name: input.name,
      costOfAttendanceModel: input.costOfAttendanceModel,
      avgGrantScholarshipAidBreakdownModel: input.avgGrantScholarshipAidBreakdownModel,
      avgGrantScholarshipAidByIncomeModel: input.avgGrantScholarshipAidByIncomeModel
    };

    return dto;
  }
  toDomain(input: InstitutionModelDto): Result<InstitutionModel>
  {
    return InstitutionModel.create
      (
        {
          name: input?.name ?? InstitutionModel.defaultProps.name,
          costOfAttendanceModel: input?.costOfAttendanceModel ?? InstitutionModel.defaultProps.costOfAttendanceModel,
          avgGrantScholarshipAidBreakdownModel: input?.avgGrantScholarshipAidBreakdownModel ?? InstitutionModel.defaultProps.avgGrantScholarshipAidBreakdownModel,
          avgGrantScholarshipAidByIncomeModel: input?.avgGrantScholarshipAidByIncomeModel ?? InstitutionModel.defaultProps.avgGrantScholarshipAidByIncomeModel
        }
      );
  }
}
