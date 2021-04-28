import { Entity, Guard, Result } from '@vantage-point/ddd-core';


export interface InstructionalProgramModelProps
{
  title: string;
}

export class InstructionalProgramModel extends Entity<InstructionalProgramModelProps>
{
  get title(): string
  {
    return this.props.title;
  }

  private constructor(props: InstructionalProgramModelProps)
  {
    super(props);
  }

  static create(props: InstructionalProgramModelProps): Result<InstructionalProgramModel>
  {
    const propsResult = Guard.againstNullOrUndefinedBulk([]);

    if (!propsResult.succeeded)
    {
      return Result.failure<InstructionalProgramModel>(propsResult.message || 'user model properties error');
    }

    const model = new InstructionalProgramModel
      (
        {
          ...props
        }
      );

    return Result.success<InstructionalProgramModel>(model);
  }

  static get defaultProps(): InstructionalProgramModelProps
  {
    const props: InstructionalProgramModelProps =
    {
      title: null,
    };

    return props;
  }
}
