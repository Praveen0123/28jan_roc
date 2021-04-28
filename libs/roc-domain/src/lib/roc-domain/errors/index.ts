import { UseCaseError } from '@vantage-point/ddd-core';


export class CreateRocModelError extends UseCaseError
{
  private constructor(error: Error)
  {
    super(`Error happened while creating a new ROI Model:`, error);
  }

  public static create(error: Error): CreateRocModelError
  {
    return new CreateRocModelError(error);
  }
}


export class RocAggregateMissingError extends UseCaseError
{
  private constructor(message: string, error?: Error)
  {
    super(message, error);
  }

  public static create(message: string, error?: Error): RocAggregateMissingError
  {
    return new RocAggregateMissingError(message, error);
  }
}


export class InvalidRoiModelError extends UseCaseError
{
  private constructor(message: string, error: Error)
  {
    super(message, error);
  }

  public static create(message: string, error: Error): InvalidRoiModelError
  {
    return new InvalidRoiModelError(message, error);
  }
}


export class RocAggregateError extends UseCaseError
{
  private constructor(message: string, error: Error, errorType?: string, details?: string)
  {
    super(message, error, errorType, details);
  }

  public static create(message: string, error: Error, errorType?: string, details?: string): RocAggregateError
  {
    return new RocAggregateError(message, error, errorType, details);
  }
}
