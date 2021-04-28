import { Entity, Guard, Result } from '@vantage-point/ddd-core';

import { AvgGrantScholarshipAidBreakdownModel, AvgGrantScholarshipAidByIncomeModel, CostOfAttendanceModel } from '../../models/interfaces';


export interface InstitutionModelProps
{
  name: string;
  costOfAttendanceModel: CostOfAttendanceModel;
  avgGrantScholarshipAidBreakdownModel: AvgGrantScholarshipAidBreakdownModel;
  avgGrantScholarshipAidByIncomeModel: AvgGrantScholarshipAidByIncomeModel;
}

export class InstitutionModel extends Entity<InstitutionModelProps>
{
  get name(): string
  {
    return this.props.name;
  }
  get costOfAttendanceModel(): CostOfAttendanceModel
  {
    return this.props.costOfAttendanceModel;
  }
  get avgGrantScholarshipAidBreakdownModel(): AvgGrantScholarshipAidBreakdownModel
  {
    return this.props.avgGrantScholarshipAidBreakdownModel;
  }
  get avgGrantScholarshipAidByIncomeModel(): AvgGrantScholarshipAidByIncomeModel
  {
    return this.props.avgGrantScholarshipAidByIncomeModel;
  }

  private constructor(props: InstitutionModelProps)
  {
    super(props);
  }

  static create(props: InstitutionModelProps): Result<InstitutionModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<InstitutionModel>(propsResult.message || 'user model properties error');
    }

    const model = new InstitutionModel
      (
        {
          ...props
        }
      );

    return Result.success<InstitutionModel>(model);
  }

  static get defaultProps(): InstitutionModelProps
  {
    const props: InstitutionModelProps =
    {
      name: null,
      costOfAttendanceModel: null,
      avgGrantScholarshipAidBreakdownModel: null,
      avgGrantScholarshipAidByIncomeModel: null
    };

    return props;
  }
}
