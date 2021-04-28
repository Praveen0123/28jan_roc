import { Result, UniqueEntityID } from '@vantage-point/ddd-core';

import { RocAggregate, RocModel, UserModel } from '../domain';
import { RocAggregateDto, RocModelDto, UserModelDto } from '../models';
import { RocModelMapper } from './roc-model.mapper';
import { UserModelMapper } from './user-model.mapper';


export class RocModelAggregateMapper
{
  private constructor()
  {
  }

  public static create(): RocModelAggregateMapper
  {
    return new RocModelAggregateMapper();
  }

  async toDTO(input: RocAggregate): Promise<RocAggregateDto>
  {
    const rocModelMapper: RocModelMapper = RocModelMapper.create();
    const userModelDto: UserModelDto = (input.userModel) ? UserModelMapper.create().toDTO(input.userModel) : null;
    const rocModelList: RocModelDto[] = await rocModelMapper.toDTOList(input);

    const rocAggregateDto: RocAggregateDto =
    {
      rocAggregateId: input.rocAggregateId,
      name: input.name,
      userModelDto: userModelDto,
      activeRocModelId: input.activeModel.roiModelId.id.toString(),
      rocModelList: rocModelList,
      lastUpdated: input.lastUpdated
    };

    return rocAggregateDto;
  }

  toDomain(input: RocAggregateDto): Result<RocAggregate>
  {
    const rocModelMapper: RocModelMapper = RocModelMapper.create();
    const userModelOrFailure: Result<UserModel> = UserModelMapper.create().toDomain(input.userModelDto);


    if (userModelOrFailure.isSuccess)
    {
      const userModel: UserModel = userModelOrFailure.getValue();

      const rocAggregateOrFailure: Result<RocAggregate> = RocAggregate.create
        (
          {
            name: input.name,
            userModel: userModel,
            rocModel: null,
            lastUpdated: input?.lastUpdated ?? new Date()
          },
          UniqueEntityID.create(input.rocAggregateId)
        );

      if (rocAggregateOrFailure.isSuccess)
      {
        const rocAggregate: RocAggregate = rocAggregateOrFailure.getValue();

        const list: RocModel[] = [];

        input.rocModelList.map((item: RocModelDto) =>
        {
          const rocModelOrFailure: Result<RocModel> = rocModelMapper.toDomain(item);

          if (rocModelOrFailure.isSuccess)
          {
            list.push(rocModelOrFailure.getValue());
          }
        });

        rocAggregate.loadModelList(list);

        rocAggregate.makeActive(input.activeRocModelId);

        return Result.success<RocAggregate>(rocAggregate);
      }

      throw rocAggregateOrFailure.getError();
    }

    throw userModelOrFailure.getError();
  }
}
