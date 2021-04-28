import { Injectable } from '@angular/core';
import { OptimizedOutOfPocketLinearPoints } from '@gql';
import { Result, UniqueEntityID } from '@vantage-point/ddd-core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { RoiAggregate, RoiModelId } from '../domain';
import { ActiveRoiDto, CareerGoalDto, CurrentInformationDto, DialogDataToKeepModel, EducationCostDto, EducationFinancingDto, RoiModelDto, RoiModelToSaveDto } from '../dtos';
import { CreateRoiModelError, RoiModelError, RoiModelMissingError } from '../errors';
import { RoiModelAggregateMapper } from '../mappers/roi-aggregate.mapper';
import { UserModelMapper } from '../mappers/user-model.mapper';
import { RoiCalculatorOutputModel } from '../models';
import { LifetimeEarningsService } from './lifetime-earnings.service';


@Injectable()
export class RoiModelService
{
  private roiModelAggregateMapper: RoiModelAggregateMapper = RoiModelAggregateMapper.create();

  private roiAggregateSubject: BehaviorSubject<RoiAggregate> = new BehaviorSubject<RoiAggregate>(undefined);
  private roiModelCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private roiModelListSubject: BehaviorSubject<RoiModelDto[]> = new BehaviorSubject<RoiModelDto[]>(undefined);
  private roiAggregateErrorSubject: BehaviorSubject<RoiModelError> = new BehaviorSubject<RoiModelError>(undefined);


  public readonly roiModelCount$ = this.roiModelCountSubject.asObservable();
  public readonly roiModelList$ = this.roiModelListSubject.asObservable();
  public readonly roiModelError$ = this.roiAggregateErrorSubject.asObservable();

  constructor
    (
      private lifetimeEarningsService: LifetimeEarningsService
    )
  {
    const emptyRoiAggregateOrError: Result<RoiAggregate> = RoiAggregate.create(RoiAggregate.defaultProps);

    if (emptyRoiAggregateOrError.isSuccess)
    {
      this.processAggregate(emptyRoiAggregateOrError.getValue());
    }
  }


  fromSaveModelToAggregate(roiModelToSaveDto: RoiModelToSaveDto): Promise<boolean>
  {
    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregateOrSuccess: Result<RoiAggregate> = this.roiModelAggregateMapper.toDomainFromSavedModel(roiModelToSaveDto);

        if (roiAggregateOrSuccess.isSuccess)
        {
          this.lifetimeEarningsService.clear();

          this.processAggregate(roiAggregateOrSuccess.getValue());

          resolve(true);
        }

        reject(roiAggregateOrSuccess.getError());
      }
      catch (error)
      {
        const message: string = `TO DOMAIN FROM SAVED MODEL | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  fromAggregateToSaveModel(): Promise<RoiModelToSaveDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;
        const roiModelToSaveDto: RoiModelToSaveDto = this.roiModelAggregateMapper.toSaveDTO(roiAggregate);

        resolve(roiModelToSaveDto);
      }
      catch (error)
      {
        const message: string = `TO SAVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  getDefaultAggregateToSaveModel(): Promise<RoiModelToSaveDto>
  {
    return new Promise((resolve, reject) =>
    {
      try
      {
        const emptyRoiAggregateOrError: Result<RoiAggregate> = RoiAggregate.create(RoiAggregate.defaultProps);

        if (emptyRoiAggregateOrError.isSuccess)
        {
          const roiModelToSaveDto: RoiModelToSaveDto = this.roiModelAggregateMapper.toSaveDTO(emptyRoiAggregateOrError.getValue());

          resolve(roiModelToSaveDto);
        }

        reject(emptyRoiAggregateOrError.getError());
      }
      catch (error)
      {
        const message: string = `TO SAVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }


  createNewAggregate(): Promise<boolean>
  {
    return new Promise((resolve, reject) =>
    {
      try
      {
        this.resetSubjects();

        const emptyRoiAggregateOrError: Result<RoiAggregate> = RoiAggregate.create(RoiAggregate.defaultProps);

        if (emptyRoiAggregateOrError.isSuccess)
        {
          this.lifetimeEarningsService.clear();

          this.processAggregate(emptyRoiAggregateOrError.getValue());

          resolve(true);
        }

        reject(emptyRoiAggregateOrError.getError());
      }
      catch (error)
      {
        const message: string = `CREATE NEW AGGREGATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  createEmptyRoiModel(name?: string): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.createEmptyRoiModel(name);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `CREATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  cloneRoiModel(dialogDataToKeepModel: DialogDataToKeepModel): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.clone(dialogDataToKeepModel);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `DUPLICATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }


  makeActive(roiModelDto: RoiModelDto): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.makeActive(roiModelDto.roiModelId);

        this.lifetimeEarningsService.clear();

        this.processAggregate(roiAggregate);

        this.lifetimeEarningsService.loadGraph(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `MAKE ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  getActiveRoiModel(): Promise<ActiveRoiDto>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        resolve(this.toActiveRoiDto());
      }
      catch (error)
      {
        const message: string = `GET ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  deleteRoiModel(roiModelDto: RoiModelDto): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiModelId: RoiModelId = RoiModelId.create(roiModelDto.roiModelId);
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.deleteRoiModel(roiModelId);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `DELETE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }


  isCurrentInformationValid(): boolean
  {
    this.checkIfRoiAggregateExists();

    const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

    return roiAggregate.isCurrentInformationValid();
  }
  isCareerGoalValid(): boolean
  {
    this.checkIfRoiAggregateExists();

    const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

    return roiAggregate.isCareerGoalValid();
  }
  isEducationCostValid(): boolean
  {
    this.checkIfRoiAggregateExists();

    const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

    return roiAggregate.isEducationCostValid();
  }


  renameAggregate(name: string): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.updateRoiAggregateName(name);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `GET ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  resetAggregate(): Promise<boolean>
  {
    const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;
    const roiAggregateId: UniqueEntityID = roiAggregate.id;

    return new Promise((resolve, reject) =>
    {
      try
      {
        this.resetSubjects();

        const emptyRoiAggregateOrError: Result<RoiAggregate> = RoiAggregate.create(RoiAggregate.defaultProps, roiAggregateId);

        if (emptyRoiAggregateOrError.isSuccess)
        {
          this.lifetimeEarningsService.clear();

          this.processAggregate(emptyRoiAggregateOrError.getValue());

          resolve(true);
        }

        reject(emptyRoiAggregateOrError.getError());
      }
      catch (error)
      {
        const message: string = `RESET AGGREGATE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  renameModel(name: string): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.updateRoiModelName(name);

        this.lifetimeEarningsService.updateLegendWithModelName(name);
        this.roiModelListSubject.next(this.roiModelAggregateMapper.toDTOList(roiAggregate));

        resolve(true);
      }
      catch (error)
      {
        const message: string = `GET ACTIVE | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }





  /* #region  UPDATE AGGREGATE FROM DATA ENTRY FORMS */

  updateCurrentInformation(currentInformationDto: CurrentInformationDto): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.updateCurrentInformation(currentInformationDto);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `UPDATE CURRENT INFORMATION | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  updateCareerGoal(careerGoalDto: CareerGoalDto): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.updateCareerGoal(careerGoalDto);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `UPDATE CAREER GOAL | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  updateEducationCost(educationCostDto: EducationCostDto): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.updateEducationCost(educationCostDto);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `UPDATE EDUCATION COST | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }
  updateEducationFinancing(educationFinancingDto: EducationFinancingDto): Promise<boolean>
  {
    this.checkIfRoiAggregateExists();

    return new Promise((resolve, reject) =>
    {
      try
      {
        const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

        roiAggregate.updateEducationFinancing(educationFinancingDto);

        this.processAggregate(roiAggregate);

        resolve(true);
      }
      catch (error)
      {
        const message: string = `UPDATE EDUCATION FINANCING | ${error.message}`;
        reject(this.surfaceError(message, error));
      }
    });
  }

  /* #endregion */






  private processAggregate(roiAggregate: RoiAggregate): ActiveRoiDto
  {
    this.runCalculator(roiAggregate);
    this.runOutOfPocketOptimizer(roiAggregate);

    this.roiAggregateSubject.next(roiAggregate);
    this.roiModelListSubject.next(this.roiModelAggregateMapper.toDTOList(roiAggregate));
    this.roiModelCountSubject.next(roiAggregate.modelCount);

    return this.toActiveRoiDto();
  }

  private runCalculator(roiAggregate: RoiAggregate): void
  {
    try
    {
      if (roiAggregate)
      {
        // console.log('CALCULATOR | 0.1');

        // CALCULATE ROI INPUT
        roiAggregate.calculateRoiCalculatorInput()
          .then((shouldCalculatorRun: boolean) =>
          {
            // console.log('CALCULATOR | 0.2');

            if (shouldCalculatorRun)
            {
              // RUN CALCULATOR
              this.lifetimeEarningsService.calculate(roiAggregate, roiAggregate.roiCalculatorInput)
                .pipe
                (
                  take(1),
                  map((roiCalculatorOutput: RoiCalculatorOutputModel) =>
                  {
                    // console.log('CALCULATOR ** RESULTS ** | 0.3');
                    roiAggregate.updateRoiCalculatorOutput(roiCalculatorOutput);
                  }),
                  catchError((error: any) =>
                  {
                    const details: string = JSON.stringify(roiAggregate.roiCalculatorInput);

                    this.surfaceError(error.message, error, 'CALCULATOR - 0', details);

                    return of(error);
                  })
                )
                .subscribe();
            }
          });
      }
    }
    catch (error)
    {
      const details: string = JSON.stringify(roiAggregate.roiCalculatorInput);
      this.surfaceError(error.message, error, 'CALCULATOR - 1', details);
      // console.log('********* ERROR | 1:', error);
    }
  }

  private runOutOfPocketOptimizer(roiAggregate: RoiAggregate): void
  {
    try
    {
      if (roiAggregate)
      {
        // SHOULD RUN OPTIMIZER
        roiAggregate.shouldCalculateOptimizedOutPocketLinearPoints()
          .then((shouldRunOptimizer: boolean) =>
          {
            if (shouldRunOptimizer)
            {
              roiAggregate.shouldResetOptimizedOutPocketLinearPoints().then((shouldResetOptimizer: boolean) =>
              {
                if (shouldResetOptimizer)
                {
                  roiAggregate.updateOptimizedOutOfPocketLinearPoints(null);
                } else
                {
                  // RUN CALCULATOR
                  this.lifetimeEarningsService.calculateOptimizedOutPocketLinearPoints(roiAggregate.optimizedOutOfPocketLinearPointsInput)
                    .pipe
                    (
                      take(1),
                      map((linearPoints: OptimizedOutOfPocketLinearPoints) =>
                      {
                        roiAggregate.updateOptimizedOutOfPocketLinearPoints(linearPoints);
                      }),
                      catchError((error: any) =>
                      {
                        const details: string = JSON.stringify(roiAggregate.roiCalculatorInput);

                        this.surfaceError(error.message, error, 'OUT OF POCKET EXPENSES OPTIMIZER - 0', details);

                        return of(error);
                      })
                    )
                    .subscribe();
                }
              });
            }
          });
      }
    }
    catch (error)
    {
      const details: string = JSON.stringify(roiAggregate.roiCalculatorInput);
      this.surfaceError(error.message, error, 'OUT OF POCKET EXPENSES OPTIMIZER - 1', details);
    }
  }

  private resetSubjects(): void
  {
    this.roiAggregateSubject.next(undefined);
    this.roiModelListSubject.next(undefined);
    this.roiModelCountSubject.next(0);
    this.roiAggregateErrorSubject.next(undefined);
  }

  private toActiveRoiDto(): ActiveRoiDto
  {
    try
    {
      const userModelMapper: UserModelMapper = UserModelMapper.create();
      const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

      const activeRoiDto: ActiveRoiDto =
      {
        roiModelDto: this.roiModelAggregateMapper.toDTO(roiAggregate),
        userModelDto: userModelMapper.toDTO(roiAggregate.userModel)
      };

      return activeRoiDto;
    }
    catch (error)
    {
      throw CreateRoiModelError.create(error);
    }
  }

  private checkIfRoiAggregateExists()
  {
    const roiAggregate: RoiAggregate = this.roiAggregateSubject.value;

    if (roiAggregate === null || roiAggregate === undefined)
    {
      throw RoiModelMissingError.create(`ROI Model does not exist:`);
    }
  }

  private surfaceError(message: string, error: Error, errorType?: string, details?: string): RoiModelError
  {
    const roiModelError: RoiModelError = RoiModelError.create(message, error, errorType, details);
    this.roiAggregateErrorSubject.next(roiModelError);

    return roiModelError;
  }

}
