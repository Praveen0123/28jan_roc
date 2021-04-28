import { IMapper, Result } from '@vantage-point/ddd-core';

import { InstructionalProgramModel } from '../domain';
import { InstructionalProgramModelDto } from '../models';


export class InstructionalProgramModelMapper implements IMapper<InstructionalProgramModel, InstructionalProgramModelDto>
{
  private constructor()
  {
  }

  public static create(): InstructionalProgramModelMapper
  {
    return new InstructionalProgramModelMapper();
  }

  toDTO(input: InstructionalProgramModel): InstructionalProgramModelDto
  {
    const dto: InstructionalProgramModelDto =
    {
      title: input.title
    };

    return dto;
  }
  toDomain(input: InstructionalProgramModelDto): Result<InstructionalProgramModel>
  {
    return InstructionalProgramModel.create
      (
        {
          title: input?.title ?? InstructionalProgramModel.defaultProps.title
        }
      );
  }
}
