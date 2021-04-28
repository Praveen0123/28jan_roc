import { Result, UniqueEntityID } from '@vantage-point/ddd-core';

import { RocAggregate, RocModelId } from '../domain';
import { CreateRocModelError, RocAggregateError, RocAggregateMissingError } from '../errors';
import { RocModelAggregateMapper, RocModelMapper, UserModelMapper } from '../mappers';
import { RocAggregateDto, RocAndUserModelsDto, RocModelCloneDataToKeepModel, RocModelDto } from '../models';



export class RocAggregateService
{
  private rocModelAggregateMapper: RocModelAggregateMapper = RocModelAggregateMapper.create();
  private rocAggregate: RocAggregate;


  private constructor(rocAggregateDto?: RocAggregateDto)
  {
    (async () =>
    {
      try
      {
        await this.createNewAggregate(rocAggregateDto);
      }
      catch (error)
      {
        console.log(`catch triggered with exception ${error}`);
      }
    })();
  }

  static create(rocAggregateDto?: RocAggregateDto): RocAggregateService
  {
    return new RocAggregateService(rocAggregateDto);
  }

  createNewAggregate(rocAggregateDto?: RocAggregateDto): Promise<RocAndUserModelsDto>
  {
    return new Promise((resolve, reject) =>
    {
      try
      {
        const emptyRocAggregateOrError: Result<RocAggregate> = (rocAggregateDto) ? this.rocModelAggregateMapper.toDomain(rocAggregateDto) : RocAggregate.create(RocAggregate.defaultProps);

        if (emptyRocAggregateOrError.isSuccess)
        {
          this.rocAggregate = emptyRocAggregateOrError.getValue();
          resolve(this.toRocAndUserModels());
        }

        reject(emptyRocAggregateOrError.getError());
      }
      catch (error)
      {
        const message: string = `CREATE NEW ROC AGGREGATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  createNewRocModel(name?: string): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        this.rocAggregate.createNewRocModel(name);

        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `CREATE ROC MODEL| ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  cloneRocModel(cloneDataToKeepModel: RocModelCloneDataToKeepModel): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        this.rocAggregate.cloneRocModel(cloneDataToKeepModel);

        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `CLONE ROC MODEL | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  makeActive(rocModelDto: RocModelDto): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        this.rocAggregate.makeActive(rocModelDto.rocModelId);

        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `MAKE ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  getActiveRocModel(): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `GET ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  deleteRoiModel(rocModelDto: RocModelDto): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const rocModelId: RocModelId = RocModelId.create(rocModelDto.rocModelId);

        this.rocAggregate.deleteRocModel(rocModelId);

        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `DELETE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  renameRocAggregate(name: string): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        this.rocAggregate.renameRocAggregate(name);

        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `GET ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  resetAggregate(): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const rocAggregateId: UniqueEntityID = this.rocAggregate.id;
        const resetRocAggregateOrFailure: Result<RocAggregate> = RocAggregate.create(RocAggregate.defaultProps, rocAggregateId);

        if (resetRocAggregateOrFailure.isSuccess)
        {
          this.rocAggregate = resetRocAggregateOrFailure.getValue();
          resolve(this.toRocAndUserModels());
        }

        reject(resetRocAggregateOrFailure.getError());
      }
      catch (error)
      {
        const message: string = `RESET ROC AGGREGATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  renameRocModel(name: string): Promise<RocAndUserModelsDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        this.rocAggregate.renameRocModel(name);

        resolve(this.toRocAndUserModels());
      }
      catch (error)
      {
        const message: string = `RENAME ROC MODEL | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }

  fromAggregateToSaveModel(): Promise<RocAggregateDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise(async (resolve, reject) =>
    {
      try
      {
        const rocAggregateDto: RocAggregateDto = await this.rocModelAggregateMapper.toDTO(this.rocAggregate);

        resolve(rocAggregateDto);
      }
      catch (error)
      {
        const message: string = `TO SAVE MODEL | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  getDefaultAggregateToSaveModel(): Promise<RocAggregateDto>
  {
    return new Promise(async (resolve, reject) =>
    {
      try
      {
        const emptyRocAggregateOrFailure: Result<RocAggregate> = RocAggregate.create(RocAggregate.defaultProps);

        if (emptyRocAggregateOrFailure.isSuccess)
        {
          const rocAggregateDto: RocAggregateDto = await this.rocModelAggregateMapper.toDTO(emptyRocAggregateOrFailure.getValue());

          resolve(rocAggregateDto);
        }

        reject(emptyRocAggregateOrFailure.getError());
      }
      catch (error)
      {
        const message: string = `TO DEFAULT ROC AGGREGATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }


  private async toRocAndUserModels(): Promise<RocAndUserModelsDto>
  {
    try
    {
      const activeRocModelDto: RocModelDto = await RocModelMapper.create().toDTO(this.rocAggregate);

      const rocAndUserModelsDto: RocAndUserModelsDto =
      {
        rocModelDto: activeRocModelDto,
        userModelDto: UserModelMapper.create().toDTO(this.rocAggregate.userModel)
      };

      return rocAndUserModelsDto;
    }
    catch (error)
    {
      throw CreateRocModelError.create(error);
    }
  }

  private checkIfRoiAggregateExists()
  {

    if (this.rocAggregate === null || this.rocAggregate === undefined)
    {
      throw RocAggregateMissingError.create(`ROI Model does not exist:`);
    }
  }

  private surfaceError(message: string, error: Error, errorType?: string, details?: string): RocAggregateError
  {
    return RocAggregateError.create(message, error, errorType, details);
  }

}

export const rocAggregateService: RocAggregateService = RocAggregateService.create();
